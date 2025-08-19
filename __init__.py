from resources.Consts import consts
from app.App import config, logger
from pathlib import Path
from executables.acts.Executables.RunAct import RunAct
from db.Models.Content.StorageUnit import StorageUnit
from utils.MainUtils import dump_json, parse_json
import aiohttp, aiohttp_jinja2, jinja2
import os

consts["context"] = "web"
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "assets")

def check_node_modules():
    cwd = Path.cwd()
    cwd_web = Path.joinpath(cwd, "app").joinpath("Views").joinpath("Web")
    dir_js_modules = cwd_web.joinpath("assets").joinpath("js")
    dir_node_modules = dir_js_modules.joinpath("node_modules")

    if dir_node_modules.is_dir() == False:
        os.chdir(str(dir_js_modules))
        os.system("npm install")
        os.chdir(str(cwd))

check_node_modules()

app = aiohttp.web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(TEMPLATES_DIR))

@aiohttp_jinja2.template('index.html')
async def index(request):
    return {'config': config}

async def _act(args):
    act = RunAct()
    output = await act.safeExecute(args)

    return output

async def act(request):
    args = await request.post()
    output = _act(args)

    return aiohttp.web.json_response(text=dump_json({
        "payload": output
    }))

async def static(request):
    path = request.match_info.get('path', '')
    static_file = os.path.join(STATIC_DIR, path)

    if os.path.exists(static_file) and os.path.isfile(static_file):
        return aiohttp.web.FileResponse(static_file)

    return aiohttp.web.HTTPNotFound(text="not found")

async def storage_unit_file(request):
    su_id = int(request.match_info.get('id', ''))
    path = request.match_info.get('path', '')

    storage_unit = StorageUnit.ids(su_id)
    if storage_unit == None:
        return aiohttp.web.HTTPNotFound(text="not found")

    storage_path = storage_unit.dir_path()
    path_to_file = storage_path / path

    try:
        path_to_file.resolve().relative_to(storage_path.resolve())
    except (ValueError, RuntimeError):
        raise aiohttp.web.HTTPForbidden(reason="access denied")

    if not path_to_file.is_file():
        raise aiohttp.web.HTTPNotFound()

    return aiohttp.web.FileResponse(str(path_to_file))

async def upload(request):
    reader = await request.multipart()

    field = await reader.next()

    name = await field.read(decode=True)
    field = await reader.next()
    filename = field.filename
    size = 0

    su = StorageUnit()
    su.generate_hash()
    su.upload_name = filename

    with open(os.path.join('/spool/yarrr-media/mp3/', filename), 'wb') as f:
        while True:
            chunk = await field.read_chunk()  # 8192 bytes by default.
            if not chunk:
                break
            size += len(chunk)
            f.write(chunk)

async def websocket_connection(request):
    ws = aiohttp.web.WebSocketResponse()

    logger.log(message=f"Started WebSocket connection", kind=logger.KIND_MESSAGE, section=logger.SECTION_WEB)

    async def __logger_hook(**kwargs):
        components = kwargs["components"]

        try:
            await ws.send_str(dump_json({
                "type": "log",
                "event_index": 0,
                "payload": components
            }))
        except Exception:
            pass

    logger.add_hook("log", __logger_hook)

    await ws.prepare(request)

    async for msg in ws:
        if msg.type != aiohttp.web.WSMsgType.TEXT:
            continue

        data = parse_json(msg.data)
        MESSAGE_TYPE = data.get("type")
        MESSAGE_INDEX = data.get("event_index")
        MESSAGE_PAYLOAD = data.get("payload")

        match (MESSAGE_TYPE):
            case "act":
                res = await _act(MESSAGE_PAYLOAD)

                await ws.send_str(dump_json({
                    "type": MESSAGE_TYPE,
                    "event_index": MESSAGE_INDEX,
                    "payload": res
                }))

    return ws

app.router.add_get('/', index)
app.router.add_post('/api/act', act)
app.router.add_post('/upload', upload)
app.router.add_get('/su{id:.*}/{path:.*}', storage_unit_file)
app.router.add_get('/static/{path:.*}', static)
app.router.add_get('/ws', websocket_connection)

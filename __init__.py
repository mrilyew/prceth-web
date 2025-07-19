from repositories.ActsRepository import ActsRepository
from resources.Consts import consts
from app.App import app, config
from pathlib import Path
import traceback
import tornado
import asyncio
import json
import os

consts['context'] = 'web'

settings = {
    "debug": config.get("web.debug") == True,
    "static_path": os.path.join(os.path.dirname(__file__), "assets"),
    "template_path": "",
    "static_hash_cache": False
}

# Checking npm modules installed

cwd = Path.cwd()
web = Path.joinpath(cwd, "app").joinpath("Views").joinpath("Web")
js_modules = web.joinpath("assets").joinpath("js")
node_modules = js_modules.joinpath("node_modules")

if node_modules.is_dir() == False:
    os.chdir(str(js_modules))
    os.system("npm install")
    os.chdir(str(cwd))

class MainPageHandler(tornado.web.RequestHandler):
    def get(self):
        context = {
            "config": config, 
        }

        self.render("index.html", **context)

class ActHandler(tornado.web.RequestHandler):
    async def post(self):
        args = { k: self.get_argument(k) for k in self.request.arguments }

        assert "i" in args, "pass the name of act as --i"

        act_name = args.get("i")
        act_class = ActsRepository().getByName(plugin_name=act_name)

        assert act_class != None, "act not found"

        act = act_class()
        act_response = await act.safeExecute(args)

        self.write(json.dumps({
            "payload": act_response
        }, ensure_ascii=False))

    def write_error(self, status_code, **kwargs):
        exc = kwargs["exc_info"]
        json_obj = {
            "error": {
                "exception_name": exc[0].__name__,
                "message": str(exc[1]),
            }
        }

        response = json.dumps(json_obj, ensure_ascii=False)

        self.set_header("Content-Type", "application/json")
        self.set_status(400)

        print(traceback.format_exc())

        self.write(response)

def make_app():
    return tornado.web.Application([
        (r"/", MainPageHandler),
        (r"/api/act", ActHandler),
    ], **settings)

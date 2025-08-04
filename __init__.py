from repositories.ActsRepository import ActsRepository
from utils.MainUtils import dump_json, parse_json
from resources.Consts import consts
from app.App import app, config, logger, storage
from pathlib import Path
import traceback
import tornado
import tornado.websocket
import os

consts['context'] = 'web'

settings = {
    "debug": config.get("web.debug") == True,
    "static_path": os.path.join(os.path.dirname(__file__), "assets"),
    "static_hash_cache": False,
    "template_path": "",
    "websocket_ping_interval": 10,
    "websocket_ping_timeout": 10,
}

# Checking if npm modules installed

cwd = Path.cwd()
cwd_web = Path.joinpath(cwd, "app").joinpath("Views").joinpath("Web")
dir_js_modules = cwd_web.joinpath("assets").joinpath("js")
dir_node_modules = dir_js_modules.joinpath("node_modules")

if dir_node_modules.is_dir() == False:
    os.chdir(str(dir_js_modules))
    os.system("npm install")
    os.chdir(str(cwd))

# so the handlers

# "SPA"
class MainPageHandler(tornado.web.RequestHandler):
    def get(self):
        context = {
            "config": config
        }

        self.render("index.html", **context)

# Act
class ActHandler(tornado.web.RequestHandler):
    async def post(self):
        args = { a: self.get_argument(a) for a in self.request.arguments }

        assert "i" in args, "pass the name of act as --i"

        act_name  = args.get("i")
        act_instnace = ActsRepository().getByName(plugin_name=act_name)

        assert act_instnace != None, "act not found"

        act = act_instnace()
        act_response = await act.safeExecute(args)

        self.write(dump_json({
            "payload": act_response
        }))

    def write_error(self, status_code, **kwargs):
        exception = kwargs["exc_info"]

        self.set_header("Content-Type", "application/json")
        self.set_status(400)

        print(traceback.format_exc())

        self.write(dump_json({
            "error": {
                "status_code": status_code,
                "exception_name": exception[0].__name__,
                "message": str(exception[1]),
            }
        }))

# WebSocket connection
class WebSocketConnectionHandler(tornado.websocket.WebSocketHandler):
    async def open(self):
        logger.log(message=f"Started WebSocket connection", kind=logger.KIND_MESSAGE, section=logger.SECTION_WEB)

        def __logger_hook(**kwargs):
            components = kwargs["components"]

            data = {
                "type": "log",
                "event_index": 0,
                "payload": components
            }

            try:
                self.write_message(dump_json(data))
            except tornado.websocket.WebSocketClosedError as e:
                pass

        logger.add_hook("log", __logger_hook)

    async def on_message(self, message):
        message_json = None

        try:
            message_json = parse_json(message)
        except Exception:
            logger.log("Got incorrect message", section="Web!WebSockets", kind="message")
            return

        message_type  = message_json.get("type")
        message_index = message_json.get("event_index")
        message_value = message_json.get("payload")

        match message_type:
            case "act":
                args = message_value

                act_name = args.get("i")
                act_class = ActsRepository().getByName(plugin_name=act_name)

                assert act_class != None, "act not found"

                act = act_class()
                response = None

                try:
                    response = await act.safeExecute(args)
                    self.write_message(dump_json({
                        "type": message_type,
                        "event_index": message_index,
                        "payload": response
                    }))
                except Exception as _e:
                    print(traceback.format_exc())

                    self.write_message(dump_json({
                        "type": message_type,
                        "event_index": message_index,
                        "payload": None,
                        "error": {
                            "status_code": 500,
                            "exception_name": _e.__class__.__name__,
                            "message": str(_e),
                        }
                    }))

    def on_close(self):
        for hook in logger.hooks("log"):
            if hook.__name__ == "__logger_hook":
                logger.remove_hook("log", hook)

        logger.log("Connection was closed", section="Web!WebSockets", kind="message")

def make_app():
    return tornado.web.Application([
        (r"/", MainPageHandler),
        (r"/api/act", ActHandler),
        (r"/ws", WebSocketConnectionHandler)
    ], **settings)

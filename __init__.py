from app.App import app, config
from resources.Consts import consts
from pathlib import Path
from flask import Flask, request, jsonify, render_template
from repositories.ActsRepository import ActsRepository
import traceback, os

consts['context'] = 'flask'

fl_app = Flask(__name__, template_folder='templates', static_folder='assets')
fl_app.json.ensure_ascii = False

cwd = Path.cwd()
web = Path.joinpath(cwd, "app").joinpath("Views").joinpath("Web")
js_modules = web.joinpath("assets").joinpath("js")
node_modules = js_modules.joinpath("node_modules")

if node_modules.is_dir() == False:
    os.chdir(str(js_modules))
    os.system("npm install")
    os.chdir(str(cwd))

if True:
    @fl_app.errorhandler(Exception)
    def handle_exception(error):
        json_obj = {
            "error": {
                "exception_name": type(error).__name__,
                "message": str(error),
            }
        }

        response = jsonify(json_obj)
        response.status_code = 400
        response.mimetype = "application/json"

        print(traceback.format_exc())

        return response

@fl_app.route("/")
def main_page():
    return render_template("index.html", config=config)

@fl_app.route("/api/act", methods=["POST"])
async def run_act():
    args = request.form

    assert "i" in args, "pass the name of act as --i"

    act_name = args.get("i")
    act_class = ActsRepository().getByName(plugin_name=act_name)

    assert act_class != None, "act not found"

    act = act_class()
    act_response = await act.safeExecute(args)

    return jsonify({
        'payload': act_response
    })

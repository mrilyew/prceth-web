import BaseController from "./BaseController.js"
import app from "../app.js"
import tr from "../langs/locale.js"
import MessageBox from "../utils/MessageBox.js"

export class AboutController extends BaseController {
    async main() {
        app.content_side.set(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>...?</b>
            </div>
        `)
        app.title(tr("common_page"))
    }

    async test() {
        app.content_side.set(`
            <div id="__test" style="padding: 10px 10px;">
                <input type="button" id="runmsg" value="msg">
            </div>
        `)
        app.title("test")

        u("#__test").on("click", "#runmsg", (e) => {
            const msg = new MessageBox({
                title: "1",
                buttons: [tr('yes'), tr('no')],
                callbacks: [
                    () => {

                    },
                    () => {
                        msg.close()
                    }
                ]
            })
        })
    }
}

export default AboutController

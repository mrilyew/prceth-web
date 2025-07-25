import BaseController from "./BaseController.js"
import MessageBox from "../utils/MessageBox.js"
import tr from "../langs/locale.js"
import api from "../api.js"

export class AboutController extends BaseController {
    async main(container) {
        container.set(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>Prcet:h v0.0</b>
            </div>
        `)
        container.title(tr("main.common"))
    }

    async not_found(container) {
        container.set(`
            <div id="not_found_page" style="padding: 10px 10px;">
                <h1>not found!</h1>
            </div>
        `)
        container.title(tr("main.not_found"))
    }

    async test(container) {
        container.set(`
            <div id="test_page" style="padding: 10px 10px;">
                <input type="button" id="run_msg" value="Show messagebox">
                <input type="button" id="run_placeholder" value="Show loader">
            </div>
        `)
        container.title("debug")

        u("#test_page").on("click", "#run_msg", (e) => {
            new MessageBox({
                title: "1",
                buttons: [tr('yes'), tr('no')],
                callbacks: [() => {},() => {}]
            })
        })
        u("#test_page").on("click", "#run_placeholder", (e) => {
            container.set(`<div class="placeholder"></div>`)
        })
    }

    async stat(container) {
        const stat = await api.act({
            "i": "App.Stat"
        })

        container.set(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>${tr("statistics")}</b>
                <p>${stat.payload.content_units.total_count} units</p>
            </div>
        `)
        container.title(tr("statistics"))
    }
}

export default AboutController

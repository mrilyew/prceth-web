import BaseController from "./BaseController.js"
import MessageBox from "../ui/MessageBox.js"
import tr from "../langs/locale.js"
import api from "../api.js"
import routes from "../resources/routes.js"

export class AboutController extends BaseController {
    async main(container) {
        container.set(`
            <div id="about_page">
                <b>Prcet:h v0.0</b>
            </div>
        `)
        container.title(tr("main.common"))
    }

    async not_found(container) {
        container.set(`
            <div id="not_found_page" style="padding: 10px 10px;">
                <span>not_found_page</span>
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
            <div id="stat_page" style="padding: 10px 10px;">
                <b>${tr("statistics")}</b>
                <p>${stat.content_units.total_count} units</p>
            </div>
        `)
        container.title(tr("statistics"))
    }

    async pages_list(container) {
        container.node.html(`
            <div id="all_pages" style="margin:10px;"></div>    
        `)

        routes.forEach(el => {
            container.node.find("#all_pages").append(`
                <p><a href="#${el.route}">${el.route}</a></p>
            `)
        })
    }
}

export default AboutController

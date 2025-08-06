import BaseController from "./BaseController.js"
import MessageBox from "../ui/MessageBox.js"
import FloatingWindow from "../ui/FloatingWindow.js"
import tr from "../langs/locale.js"
import api from "../api.js"
import router from "../router.js"
import routes from "../resources/routes.js"

export class AboutController extends BaseController {
    async main(container) {
        container.set(`
            <div id="about_page">
                <div id="name_frame">
                    <b>Prcet:h v0.0</b>
                </div>

                <div id="links">
                    <div class="scroll_element">
                        <a href="#stat" class="scroll_element_title">
                            <div class="name"><b>${tr("nav.stat")}</b></div>
                        </a>
                        <a href="#test" class="scroll_element_title">
                            <div class="name"><b>Debug</b></div>
                        </a>
                    </div>
                </div>

                <div id="routes">
                    <b>${tr("index.routes")}</b>

                    <div id="routes_list"></div>
                </div>
            </div>
        `)

        routes.forEach(el => {
            container.node.find("#routes #routes_list").append(`
                <a href="#${el.route}">${el.route}</a>
            `)
        })

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
            <div id="test_page">
                <div style="padding: 10px 10px;">
                    <input type="button" id="run_msg" value="Show messagebox">
                    <input type="button" id="run_placeholder" value="Show loader">
                </div>
                <div style="padding: 10px 10px;">
                    <input type="text" id="float_text">
                    <input type="button" id="run_float" value="run route as floating window">
                </div>
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
        u("#test_page").on("click", "#run_float", async (e) => {
            const route = u("#float_text").nodes[0].value
            const found = router.__findRoute(route)

            if (found) {
                await FloatingWindow.open(found)
            }
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
}

export default AboutController

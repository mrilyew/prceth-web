import {proc_strtr, escapeHtml} from "../utils/utils.js"
import app from "../app.js"
import router from "../router.js"

class CommonNavigation {
    constructor() {
        u("#tabs > #items_list > #items").on("mouseup", ".tab", (e) => {
            const target = u(e.target)
            const tab = target.closest(".tab")
            const tab_id = tab.nodes[0].dataset.id

            if (target.attr("id") == "close_btn") {
                app.content.closeTabById(tab_id)
                if (app.content.current_tab_id == tab_id) {
                    app.content.focusTab(app.content.tabs[0])
                }

                return
            }

            app.content.focusTabById(tab_id)
        })

        u("#tabs > #items_list").on("click", "#items_add", () => {
            const _tab = app.content.openTab()
            app.content.focusTab(_tab)

            router.go_to("#index")
        })
    }

    addTab(tab) {
        u("#tabs #items").append(`
            <a data-id="${tab.id}" class="tab">
                <span class="tab_name"></span>
                <div id="close_btn">x</div>
            </a>
        `)

        this.setTabTitle(tab)
    }

    removeTab(tab) {
        if (tab) {
            u(`#tabs #items .tab[data-id="${tab.id}"]`).remove()
        }
    }

    setTabTitle(tab) {
        document.title = tab.title + " - " + app.config.items["ui.name"]

        u(`#tabs #items .tab[data-id="${tab.id}"] .tab_name`).html(proc_strtr(escapeHtml(tab.title), 30))
    }

    focusTab(tab) {
        u('#tabs #items a').removeClass('selected')

        if (tab) {
            document.title = tab.title + " - " + app.config.items["ui.name"]

            u(`#tabs #items a[data-id="${tab.id}"]`).addClass('selected')
        }
    }
}

export default CommonNavigation

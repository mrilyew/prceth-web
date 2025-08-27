import tr from "./locale.js"
import router from "./router.js"
import Container from "./ui/Container.js"
import MessageBox from "./ui/MessageBox.js"
import menu from "./resources/menu.js"
import ApiError from "./exceptions/ApiError.js"
import {proc_strtr, escapeHtml} from "./utils/utils.js"
import FloatingWindow from "./ui/FloatingWindow.js"

// class that represents page
export const app = new class {
    float_windows = []
    messageboxes = []

    main_template() {
        u("body").append(`<div class="dimmer"></div>`)
        u('#app').html(`
            <div id="tabs"></div>
        `)
    }

    constructor() {
        this.main_template()
        this.content_side = new Container('#app #page', true, {
            "new_tab": (tab) => {
                this.navigation.addTab(tab)
            },
            "close_tab": (tab) => {
                this.navigation.removeTab(tab)
            },
            "title_change": (tab) => {
                this.navigation.setTabTitle(tab)
            },
            "tab_focus": (tab) => {
                this.navigation.focusTab(tab)
            }
        })

        window.addEventListener("hashchange", async (event) => {
            this.sidebar.hide()
            await router.route(event.newURL)
        })

        window.addEventListener("DOMContentLoaded", async () => {
            await router.route(location.href)
        })
    }
}

export const sidebar = new class {
    show() {
        if (u('#app #sidebar').hasClass("waiting_animation")) {
            u('#app #sidebar_menu').addClass("moved")
        }
    }

    hide() {
        u('#app #sidebar').removeClass('waiting_animation')
        u('#app #sidebar_menu').removeClass("moved")
    }
}

export const navigation = new class {
    addTab(tab) {
        u('#status-bar #_place').append(`<a data-id="${tab.id}" class="tab">
            <span class="tab_name"></span>
            <div id="close_btn">x</div>
        </a>`)
        this.setTabTitle(tab)
    }

    removeTab(tab) {
        if (tab) {
            u(`#status-bar .tab[data-id="${tab.id}"]`).remove()
        }
    }

    setTabTitle(tab) {
        document.title = tab.title + " - " + window.cfg['ui.name']

        u(`#status-bar .tab[data-id="${tab.id}"] .tab_name`).html(proc_strtr(escapeHtml(tab.title), 30))
    }

    focusTab(tab) {
        u('#status-bar a').removeClass('selected')

        if (tab) {
            document.title = tab.title + " - " + window.cfg['ui.name']

            u(`#status-bar a[data-id="${tab.id}"]`).addClass('selected')
        }
    }
}

export const common_connection = new class {
    ws = null
    callback_dictionary = {}
    event_index = 0

    constructor() {
        this.connect()
    }

    connect() {
        this.ws = new WebSocket(`ws://${location.host}/ws`)

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({"type": "ping", "event_index": 0}));
        }

        this.ws.onmessage = (evt) => {
            const data = evt.data
            const spl_data = JSON.parse(data)

            const event_type = spl_data["type"]
            const event_index = spl_data["event_index"]
            const event_data = spl_data["payload"]

            const callback = this.callback_dictionary[event_index]

            switch(event_type) {
                case "log":
                    console.log(`Logger message: `, event_data)
                    app.logs.push(event_data)

                    break
                case "act":
                    if (callback) {
                        if (spl_data["error"]) {
                            callback.reject(new ApiError(spl_data["error"]["message"], spl_data["error"]["exception_name"], spl_data["error"]["status_code"]))
                        } else {
                            callback.resolve(event_data)
                        }
                    }
            }
        }

        const _er = (_in) => {
            this.callback_dictionary = {}
            const msg = new MessageBox({
                title: tr("exceptions.websocket_connection_closed"),
                body: tr("exceptions.websocket_connection_closed_desc"),
                buttons: [tr("messagebox.yes"), tr("messagebox.no")],
                callbacks: [() => {
                    this.connect()
                }, () => {}],
            })
        }
        //this.ws.onclose = _er
        this.ws.onerror = _er
    }

    increment_index() {
        this.event_index += 1
    }

    async act(params, attempt = 0) {
        if (attempt > 5) {
            return null
        }

        if (!this.ws.readyState) {
            await new Promise(resolve => setTimeout(resolve, 100))

            return await this.act(params, attempt + 1)
        }

        return new Promise((resolve, reject) => {
            const send = {
                "type": "act",
                "event_index": this.event_index,
                "payload": params
            }

            this.callback_dictionary[this.event_index] = {resolve, reject}

            try {
                this.ws.send(JSON.stringify(send))
                this.increment_index()
            } catch(err) {
                reject(err)
            }
        })
    }
}

export default app

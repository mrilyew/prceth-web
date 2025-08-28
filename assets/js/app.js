import tr from "./locale.js"
import router from "./router.js"
import Container from "./ui/Container.js"
import MessageBox from "./ui/MessageBox.js"
import menu from "./resources/menu.js"
import ApiError from "./exceptions/ApiError.js"
import CommonNavigation from "./ui/CommonNavigation.js"
import FloatingWindow from "./ui/FloatingWindow.js"
import Config from "./models/Config.js"

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

// class that represents page
export const app = new class {
    float_windows = []
    messageboxes = []

    main_template() {
        u("body").append(`<div class="dimmer"></div>`)
        u('#app').html(`
            <div id="bg">
                <div id="bg_1"></div>
                <div id="bg_2"></div>
            </div>
            <div id="bg_l_2">
                <div id="bg_1"></div>
            </div>
            <div id="__page">
                <div id="tabs">
                    <div id="square"></div>
                    <div id="items_list">
                        <div id="items"></div>
                        <div id="items_add">+</div>
                    </div>
                </div>
                <div id="header">
                    <span>Extraction tool</span>
                </div>
                <div id="content">
                    <div id="content_containment">
                        <div id="inserted"></div>
                    </div>
                </div>
            </div>
        `)
    }

    async _constructor() {
        this.main_template()
        this.config = new Config()
        await this.config.get_items()

        const navigation = new CommonNavigation()

        this.content = new Container('#app #content #inserted', true, {
            "new_tab": (tab) => {
                navigation.addTab(tab)
            },
            "close_tab": (tab) => {
                navigation.removeTab(tab)
            },
            "title_change": (tab) => {
                navigation.setTabTitle(tab)
            },
            "tab_focus": (tab) => {
                navigation.focusTab(tab)
            }
        })

        window.addEventListener("hashchange", async (event) => {
            await router.route(event.newURL)
        })
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await app._constructor()

    await router.route(location.href)
})

export default app

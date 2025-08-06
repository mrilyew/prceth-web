import tr from "./langs/locale.js"
import router from "./router.js"
import Container from "./ui/Container.js"
import MessageBox from "./ui/MessageBox.js"
import ApiError from "./exceptions/ApiError.js"
import {proc_strtr, escapeHtml} from "./utils/utils.js"

// class that represents page
export const app = new class {
    logs = []
    menu = [
        {
            href: "#content",
            name: tr('nav.content'),
        },
        {
            href: "#add",
            name: tr('nav.add'),
        },
        {
            href: "#exec",
            name: tr('nav.executables'),
        },
        {
            href: "#logs",
            name: tr('nav.logs'),
        },
        {
            href: "#config",
            name: tr('nav.config'),
        }
    ]
    navigation = new class {
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
    sidebar = new class {
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
    ws_connection = new class {
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
    messageboxes = []

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
        this.another_side = new Container('#app #side')

        window.addEventListener("hashchange", async (event) => {
            this.sidebar.hide()
            await router.route(event.newURL)
        })

        window.addEventListener("DOMContentLoaded", async () => {
            await router.route(location.href)
        })
    }

    up() {
        scrollTo(0, 0)
    }

    main_template() {
        u("body").append(`<div class="dimmer"></div>`)
        u('#app').html(`
            <div id="sidebar">
                <div id="sidebar_buttons">
                    <a class="sidebar_button" id="home"></a>

                    <div id="sidebar_menu">
                        <div class="sidebar_menu_buttons"></div>
                    </div>

                    <a class="sidebar_button" id="down"></a>
                </div>
            </div>
            <nav id="status-bar" class="volume">
                <div id="_place"></div>
                <a id="_append">+</a>
            </nav>
            <div id="container">
                <div id="page"></div>
                <div id="side"></div>
            </div>
        `)

        this.menu.forEach(item => {
            u("#app .sidebar_menu_buttons").append(`
                <a href="${item.href}">${item.name}</a>    
            `)
        })

        u('#app').on('click', '#home', (e) => {
            this.up()
        })

        u('#app').on('click', '#down', (e) => {
            scrollTo(0, document.body.clientHeight)
        })

        u("#app #status-bar").on("click", "#_append", () => {
            const _tab = this.content_side.openTab()
            this.content_side.focusTab(_tab)

            router.go_to("#index")
        })

        u("#app #status-bar").on("mouseup", ".tab", (e) => {
            const target = u(e.target)
            const tab = target.closest(".tab")
            const tab_id = tab.nodes[0].dataset.id

            if (target.attr("id") == "close_btn") {
                this.content_side.closeTabById(tab_id)
                if (this.content_side.current_tab_id == tab_id) {
                    this.content_side.focusTab(this.content_side.tabs[0])
                }

                return
            }

            this.content_side.focusTabById(tab_id)
        })

        u('#app #sidebar_menu').on("mouseenter", (e) => {
            u('#app #sidebar').addClass('waiting_animation')

            setTimeout(() => {
                this.sidebar.show()
            }, 100)
        })

        u('#app #sidebar').on("mouseleave", (e) => {
            setTimeout(() => {
                this.sidebar.hide()
            }, 100)
        })

        u(document).on('scroll', (e) => {
            if (scrollY < 44) {
                u('body').removeClass("scrolled")
            } else {
                u('body').addClass("scrolled")
            }
        })

        u(document).on('keyup', async (e) => {
            if(e.keyCode == 27 && app.messageboxes.length > 0) {
                const msg = app.messageboxes[app.messageboxes.length - 1]
                if(!msg) {
                    return
                }

                if(msg.close_on_buttons) {
                    msg.close()
                    return
                }

                if(msg.warn_on_exit) {
                    const res = await msg.__showCloseConfirmationDialog()
                    if(res === true) {
                        msg.close()
                    }
                }
            }
        })
    }
}

export default app

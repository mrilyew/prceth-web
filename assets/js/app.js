import tr from "./langs/locale.js"
import router from "./router.js"

// class that represents page
export const app = new class {
    navigation = new class {
        setTab(tab) {
            u('#status-bar a').removeClass('selected')
            u(`#status-bar a[data-tab="${tab}"]`).addClass('selected')
        }
    }

    messageboxes = []

    content_side = new class {
        set(content = '') {
            u('#app #page').html(content)
        }

        reset() {
            this.set('')
        }
    }

    another_side = new class {
        set(content = '') {
            u('#app #side').html(content)
        }

        reset() {
            this.set('')
        }
    }

    constructor() {
        this.main_template()

        window.addEventListener("hashchange", async (event) => {
            this.hide_sidebar()
            await router.route(event.newURL)
        })

        window.addEventListener("DOMContentLoaded", async () => {
            await router.route(location.href)
        })
    }

    up() {
        scrollTo(0, 0)
    }

    title(title) {
        document.title = title + " - " + window.cfg['ui.name']
    }

    main_template() {
        u("body").append(`<div class="dimmer"></div>`)
        u('#app').html(`
            <div id="sidebar">
                <div id="sidebar_buttons">
                    <a class="sidebar_button" id="home"></a>

                    <div id="sidebar_menu">
                        <div class="sidebar_menu_buttons">
                            <a href="#exec?cx=add">${tr("add")}</a>
                            <a href="#stat">${tr("statistics")}</a>
                            <a href="#test">Test</a>
                            <a>Logs</a>
                        </div>
                    </div>

                    <a class="sidebar_button" id="down"></a>
                </div>
            </div>
            <nav id="status-bar" class="volume">
                <a data-tab="content" class="tab" href="#content">${tr("content_tab")}</a>
                <a data-tab="exec" class="tab" href="#exec">${tr("executables_tab")}</a>
                <a data-tab="execute" class="tab hidden">${tr("executable_single_tab")}</a>
            </nav>
            <div id="container">
                <div id="page"></div>
                <div id="side"></div>
            </div>
        `)

        u('#app').on('click', '#home', (e) => {
            this.up()
        })

        u('#app').on('click', '#down', (e) => {
            scrollTo(0, document.body.clientHeight)
        })

        u('#app #sidebar_menu').on("mouseenter", (e) => {
            u('#app #sidebar').addClass('waiting_animation')

            setTimeout(() => {
                this.show_sidebar()
            }, 100)
        })

        u('#app #sidebar').on("mouseleave", (e) => {
            setTimeout(() => {
                this.hide_sidebar()
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

    show_sidebar() {
        if (u('#app #sidebar').hasClass("waiting_animation")) {
            u('#app #sidebar_menu').addClass("moved")
        }
    }

    hide_sidebar() {
        u('#app #sidebar').removeClass('waiting_animation')
        u('#app #sidebar_menu').removeClass("moved")
    }
}

export default app

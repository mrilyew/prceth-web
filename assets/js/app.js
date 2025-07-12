import tr from "./langs/locale.js"
import router from "./router.js"
import Container from "./ui/Container.js"

// class that represents page
export const app = new class {
    navigation = new class {
        setTab(tab) {
            u('#status-bar a').removeClass('selected')
            u(`#status-bar a[data-tab="${tab}"]`).addClass('selected')
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
    messageboxes = []

    constructor() {
        this.main_template()
        this.content_side = new Container('#app #page')
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
                        <div class="sidebar_menu_buttons">
                            <a href="#content">${tr('nav.content')}</a>
                            <a href="#stat">${tr('nav.statistics')}</a>
                            <a href="#test">${tr('nav.test')}</a>
                            <a>${tr('nav.logs')}</a>
                        </div>
                    </div>

                    <a class="sidebar_button" id="down"></a>
                </div>
            </div>
            <nav id="status-bar" class="volume">
                <a data-tab="add" class="tab" href="#add">${tr('nav.add')}</a>
                <a data-tab="exec" class="tab" href="#exec">${tr('nav.executables')}</a>
                <a data-tab="execute" class="tab hidden">${tr('nav.executable')}</a>
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

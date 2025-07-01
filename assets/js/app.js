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
        u('#app').html(`
            <nav id="status-bar" class="volume">
                <a href="#about"><div id="home"></div></a>
                <a data-tab="content" class="tab" href="#content">${tr("content_tab")}</a>
                <a data-tab="exec" class="tab" href="#exec">${tr("executables_tab")}</a>
                <a data-tab="execute" class="tab hidden">${tr("executable_single_tab")}</a>
            </nav>
            <div id="to_up"></div>
            <div id="container">
                <div id="page"></div>
                <div id="side"></div>
            </div>
        `)

        u('#app').on('click', '#to_up', (e) => {
            this.up()
        })
    }
}

export default app

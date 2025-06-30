import tr from "./langs/locale.js"

export const app = new class {
    navigation = new class {
        setTab(tab) {
            u('#status-bar a').removeClass('selected')
            u(`#status-bar a[data-tab="${tab}"]`).addClass('selected')
        }
    }

    renderPage() {
        u('#app').html(`
            <nav id="status-bar">
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
            scrollTo(0, 0)
        })
    }

    setSideContent(content = '') {
        u('#app #side').html(content)
    }

    setContent(content = '') {
        document.title = window.cfg['ui.name']

        u('#app #page').html(content)
    }
}

app.renderPage()

export default app

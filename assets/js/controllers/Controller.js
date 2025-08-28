import app from "../app.js"

export class Controller {
    loader(container) {
        setTimeout(() => {
            if (app.content.node.hasClass("currently_switching")) {
                app.content.node.removeClass("currently_switching")
                app.content.title('...')

                container.set(`<div class="placeholder"></div>`)
            }
        }, 2000)
    }
}

export default Controller

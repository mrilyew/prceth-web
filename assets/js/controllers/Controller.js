import app from "../app.js"

export class Controller {
    loader(container) {
        setTimeout(() => {
            if (app.content_side.node.hasClass("currently_switching")) {
                app.content_side.node.removeClass("currently_switching")
                app.content_side.title('...')

                container.set(`<div class="placeholder"></div>`)
            }
        }, 2000)
    }
}

export default Controller

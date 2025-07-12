import app from "../app.js"

export class BaseController {
    loader(container) {
        app.content_side.title('...')

        container.set(`<div class="placeholder"></div>`)
    }
}

export default BaseController

import Controller from "./Controller.js"
import routes from "../resources/routes.js"

class AboutController extends Controller {
    async main(container) {
        container.set(`
            <div>v0.0</div>
                
            <div id="routes">
                <div id="routes_list"></div>
            </div>
        `)

        routes.forEach(el => {
            container.node.find("#routes #routes_list").append(`
                <a href="#${el.route}">${el.route}</a>
            `)
        })
    }

    async not_found(container) {
        container.set(`not_found`)
    }
}

export default AboutController

import app from "./app.js"
import routes from "./resources/routes.js"
import HashURL from "./resources/HashURL.js"

// class that starts controller method
export const router = new class {
    url = null

    __findRoute(hash) {
        let result = null

        routes.forEach(item => {
            if(item.route == hash) {
                result = item
            }
        })

        return result
    }

    async go_to(route_name) {
        await this.route(location.origin + "/#" + route_name)
    }

    async route(path) {
        this.url = new HashURL(path)

        const _hash = this.url.getHash().replace('#', '')
        const route = (_hash == '' ? this.__findRoute("index") : this.__findRoute(_hash)) ?? this.__findRoute('not_found') // finding route for hash in url

        console.log(route)
        if (route.args) {
            Object.entries(route['args']).forEach(el => {
                this.url.setParam(el[0], el[1])
            })
        }

        const controller = route.class

        if (route['loader']) {
            app.content.node.addClass("currently_switching")

            controller[route.loader](app.content)
        } else {
            controller.loader(app.content)
        }

        await controller[route.method](app.content)

        app.content.node.removeClass("currently_switching")
    }
}

export default router

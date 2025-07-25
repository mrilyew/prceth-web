import app from "./app.js"
import routes from "./utils/routes.js"
import HashURL from "./utils/HashURL.js"

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

    async route(path) {
        this.url = new HashURL(path)

        const _hash = this.url.getHash().replace('#', '')
        let route = this.__findRoute(_hash) ?? this.__findRoute('not_found') // finding route for hash in url

        if (route['args']) {
            Object.entries(route['args']).forEach(el => {
                this.url.setParam(el[0], el[1])
            })
        }

        const controller = route.class

        app.navigation.setTab(_hash)
        app.another_side.reset()
        app.up()

        if (route['loader']) {
            controller[route.loader](app.content_side)
        } else {
            controller.loader(app.content_side)
        }

        await controller[route.method](app.content_side)
    }
}

export default router

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
        let route = this.__findRoute(_hash) ?? this.__findRoute('index') // finding route for hash in url

        const controller = route.class

        app.navigation.setTab(_hash)
        app.another_side.reset()
        app.up()

        controller.loader()

        await controller[route.method]()
    }
}

export default router

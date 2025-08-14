import tr from "../langs/locale.js"

class DefaultList {
    arguments = {}
    items = []
    total_count = 0
    class = null
    view_model = null
    view_models = []
    container = null
    continue_button_observers = []

    constructor(_container) {
        this.container = _container

        this.container.on("click", ".show_more", async (e) => {
            const target = u(e.target)
            const _remove = () => {
                this.continue_button_observers.forEach(element => {
                    element.unobserve(target.nodes[0])
                })

                target.remove()
            }

            const last_item = this.items[this.items.length - 1]
            if (!last_item) {
                _remove()

                return
            }

            const offset = last_item.data.id
            target.addClass('unclickable')

            const new_items = await this.next(offset)

            _remove()

            if (new_items.length > 0) {
                this.container_insert(new_items)
            }
        })
    }

    container_clear() {
        this.container.html("")
    }

    container_insert_empty_placeholder() {
        this.container.append(`
            <div class="empty_block">
                <span>${tr("content.search.nothing_found")}</span>
            </div>
        `)
    }

    container_insert_continue_button() {
        const _u = u(`
            <div class="show_more">${tr("nav.show_next")}</div>    
        `)
        this.container.append(_u)
        this.continue_button_observers.forEach(element => {
            element.observe(_u.nodes[0])
        })
    }

    container_insert(items) {
        const _models = []

        items.forEach(element => {
            _models.push(new this.view_model(this.container, element))
        })

        if (_models.length < 1) {
            this.container_insert_empty_placeholder()

            return 0
        }

        this.container_insert_viewmodels(_models)

        if (_models.length < this.total_count) {
            this.container_insert_continue_button()
        }
    }

    container_insert_viewmodels(view_models) {
        view_models.forEach(element => {
            element.render()
        })

        return view_models.length
    }

    items_replace(new_items) {
        this.items = new_items
    }

    items_insert(items) {
        this.items = this.items.concat(items)
    }

    total_count_replace(new_count) {
        this.total_count = new_count
    }

    items_clear() {
        this.items = []
    }

    view_models_clear() {
        this.view_models = []
    }

    async items_search(params = {}) {
        let new_items = await this.class.search(params)

        return new_items
    }

    async next(offset) {
        const new_items = await this.items_search(Object.assign(this.arguments, {"offset": offset}))

        this.items_insert(new_items.items)

        return new_items.items
    }

    async fetch(params = {}) {
        this.arguments = params

        const new_items = await this.items_search(params)

        this.items_replace(new_items.items)
        this.total_count_replace(new_items.total_count)

        return new_items.items
    }

    async fetch_with_insert(params) {
        const resp = await this.fetch(params)

        this.items_insert(resp)
        this.container_insert(resp)
    }
}

export default DefaultList

class ContainerTab {
    title = ""
    id = 0

    constructor(node, id) {
        if (typeof(node) == 'string') {
            this.node = u(node)
        } else {
            this.node = node
        }

        this.id = id
    }

    set(content = "") {
        this.node.html(content)
    }

    set_title(text) {
        this.title = text
    }
}

class Container {
    tabs = []
    current_tab_id = 0
    index = 0
    on_new_tab = null
    on_close_tab = null
    on_title_change = null
    on_tab_focus = null

    get current_tab() {
        return this.__tab_by_id(this.current_tab_id)
    }

    get node() {
        return this.current_tab.node
    }

    constructor(node, is_common, hooks = {}) {
        this._node = u(node)
        this.on_new_tab = hooks["new_tab"]
        this.on_close_tab = hooks["close_tab"]
        this.on_title_change = hooks["title_change"]
        this.on_tab_focus = hooks["tab_focus"]

        const c = this.openTab(this._node)
        this.focusTab(c)
    }

    openTab() {
        this.index += 1

        const id = this.index
        this._node.append(`
            <div class="virtual_tab" data-id="${id}"></div>    
        `)

        const new_tab = new ContainerTab(this._node.find(`.virtual_tab[data-id="${id}"]`), id)
        new_tab.set_title("Untitled")

        this.tabs.push(new_tab)
        if (this.on_new_tab) {
            this.on_new_tab(new_tab)
        }

        return new_tab
    }

    __tab_by_id(id) {
        return this.tabs.find(item => item.id == id)
    }

    focusTab(tab) {
        this.current_tab_id = tab.id
        this._node.find(".virtual_tab").removeClass("seen")
        this._node.find(`.virtual_tab[data-id="${this.current_tab_id}"]`).addClass("seen")

        if (this.on_tab_focus) {
            this.on_tab_focus(tab)
        }
    }

    focusTabById(id) {
        return this.focusTab(this.__tab_by_id(id))
    }

    closeTab(tab) {
        if (this.tabs.length < 2) {
            return
        }

        if (this.on_close_tab) {
            this.on_close_tab(tab)
        }

        this._node.find(`.virtual_tab[data-id="${tab.id}"]`).remove()
        this.tabs = this.tabs.filter(item => item.id != tab.id)
    }

    closeTabById(id) {
        return this.closeTab(this.__tab_by_id(id))
    }

    set(content = '') {
        this.current_tab.set(content)
    }

    reset() {
        this.set('')
    }

    title(title) {
        this.current_tab.set_title(title)

        if (this.on_title_change) {
            this.on_title_change(this.current_tab)
        }
    }
}

export default Container

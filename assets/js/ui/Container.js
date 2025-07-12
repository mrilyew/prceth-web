class Container {
    constructor(node) {
        if (typeof(node) == 'string') {
            this.node = u(node)
        } else {
            this.node = node
        }
    }

    set(content = '') {
        this.node.html(content)
    }

    reset() {
        this.set('')
    }

    title(title) {
        document.title = title + " - " + window.cfg['ui.name']
    }
}

export default Container

import Container from "./Container.js"
import app from "../app.js"
import {proc_strtr, escapeHtml} from "../utils/utils.js"

class FloatingWindow {
    static async open(route, id = "none") {
        const win = new FloatingWindow(id)
        const controller = route.class

        if (route['loader']) {
            win.container.node.addClass("currently_switching")

            controller[route.loader](win.container)
        } else {
            controller.loader(win.container)
        }

        await controller[route.method](win.container)

        win.container.node.removeClass("currently_switching")

        return win
    }

    constructor(id) {
        this.id = id

        const node = u(`
            <div class="floating_window">
                <div id="head">
                    <div>
                        <b>Untitled</b>
                    </div>

                    <div>
                        <span id="_close">x</span>
                    </div>
                </div>
                <div id="content"></div>
            </div>    
        `)

        u("body").append(node)

        node.find("#_close").on("click", (e) => {
            node.remove()

            app.float_windows = app.float_windows.filter(item => item != this)
        })

        const position = {
            x: 0,
            y: 0
        }

        interact(node.find("#head").nodes[0]).draggable({
            listeners: {
                start (event) {
                    const target = u(event.target)

                    target.closest(".floating_window").addClass("moving")
                },
                move (event) {
                    const target = u(event.target)
                    const floating_window = target.closest(".floating_window")

                    const _width = floating_window.nodes[0].getBoundingClientRect().width
                    const _height = floating_window.nodes[0].getBoundingClientRect().height

                    position.x += event.dx
                    position.y += event.dy

                    let move_x = Math.min(position.x, window.innerWidth - _width - 17)
                    let move_y = Math.min(position.y, window.innerHeight - _height)

                    move_x = Math.max(0, move_x)
                    move_y = Math.max(0, move_y)

                    position.x = Math.min(position.x, window.innerWidth)
                    position.y = Math.min(position.y, window.innerHeight)

                    floating_window.nodes[0].style.transform = `translate(${move_x}px, ${move_y}px)`
                },
                end (event) {
                    const target = u(event.target)

                    target.closest(".floating_window").removeClass("moving")
                }
            }
        })
        interact(node.nodes[0]).resizable({
            edges: { bottom: true, right: true },
            listeners: {
                move: function (event) {
                    let _width = event.rect.width
                    let _height = event.rect.height

                    Object.assign(event.target.style, {
                        width: `${Math.min(_width, window.innerWidth)}px`,
                        height: `${Math.min(_height, window.innerHeight)}px`,
                    })
                }
            }
        })

        this.container = new Container(node.find("#content"), false, {
            "title_change": (tab) => {
                node.find("#head b").html(escapeHtml(tab.title))
            },
        })

        app.float_windows.push(this)
    }
}

export default FloatingWindow

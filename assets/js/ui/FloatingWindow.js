import Container from "./Container.js"
import {proc_strtr, escapeHtml} from "../utils/utils.js"

class FloatingWindow {
    static async open(route) {
        const win = new FloatingWindow()
        const controller = route.class

        if (route['loader']) {
            win.container.node.addClass("currently_switching")

            controller[route.loader](win.container)
        } else {
            controller.loader(win.container)
        }

        await controller[route.method](win.container)

        win.container.node.removeClass("currently_switching")
    }

    constructor() {
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
        })

        const position = {
            x: 0,
            y: 0
        }

        interact(node.find("#head").nodes[0]).draggable({
            listeners: {
                start (event) {
                    console.log(event.type, event.target)
                },
                move (event) {
                    const target = u(event.target)
                    const window = target.closest(".floating_window")

                    position.x += event.dx
                    position.y += event.dy

                    const move_x = Math.min(Math.max(0, position.x), window.innerWidth)
                    const move_y = Math.max(0, position.y)

                    window.nodes[0].style.transform = `translate(${move_x}px, ${move_y}px)`
                }
            }
        })
        interact(node.nodes[0]).resizable({
            edges: { top: true, left: true, bottom: true, right: true },
            listeners: {
                move: function (event) {
                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                    })
                }
            }
        })

        this.container = new Container(node.find("#content"), false, {
            "title_change": (tab) => {
                node.find("#head b").html(escapeHtml(tab.title))
            },
        })
    }
}

export default FloatingWindow

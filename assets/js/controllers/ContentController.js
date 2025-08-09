import app from "../app.js"
import router from "../router.js"
import BaseController from "./BaseController.js"
import ContentUnit from "../models/ContentUnit.js"
import {create_json_viewer} from "../utils/utils.js"
import ContentUnitSmallViewModel from "../view_models/ContentUnitSmallViewModel.js"
import tr from "../langs/locale.js"
import Executable from "../models/Executable.js"
import ExecutableArgument from "../models/ExecutableArgument.js"
import subparams from "../resources/subparams.js"
import ShowMoreObserver from "../ui/observers/ShowMoreObserver.js"

export class ContentController extends BaseController {
    async main(container) {
        const list = new class {
            total_count = 0
            items = []
            params = {}

            async fetch(params = {}) {
                this.params = params
                const new_items = await ContentUnit.search(params)

                this.items = new_items.items
                this.total_count = new_items.total_count

                return new_items.items
            }

            async next(offset) {
                const new_items = await ContentUnit.search(Object.assign(this.params, {"offset": offset}))

                this.items = this.items.concat(new_items.items)

                return new_items.items
            }

            clear(container) {
                this.items = []
                container.html("")
            }

            insert(items, container) {
                items.forEach(itm => {
                    new ContentUnitSmallViewModel(container, itm).render()
                })

                console.log(this.items.length, this.total_count)
                if (this.items.length < this.total_count) {
                    const _u = u(`
                        <div class="show_more">${tr("nav.show_next")}</div>    
                    `)
                    container.append(_u)
                    ShowMoreObserver.observe(_u.nodes[0])
                }
            }
        }
        const input_block = new class {
            _views = []

            setParams(_container, args, tab = "cu") {
                this._views = []

                args.forEach(arg => {
                    let _u = u(`
                        <div class="container_param">
                            <span>${arg.localized_name}</span>

                            <div class="container_param_value argument_value"></div>
                        </div>
                    `)
                    if (arg.name == "query") {
                        _u = u(`
                        <div id="search_bar" class="container_param single">
                            <div class="container_param_value argument_value"></div>
                        </div>`)
                    }

                    _container.find("#container_params #_items").append(_u)

                    const argument_class_i = subparams[arg.type]
                    const argument_class = new argument_class_i(_u.find(".container_param_value"), arg)
                    argument_class.render({})

                    this._views.push(argument_class)
                })

                _container.find("#search_bar input").attr("placeholder", tr("content.search"))
            }

            collect() {
                const out = {}
                this._views.forEach(view => {
                    out[view.data.name] = view.recieveValue()
                })

                return out
            }
        }

        container.title(tr("content.title"))
        container.set(`
            <div>
                <div id="container_params">
                    <div id="_items"></div>
                    <div id="_search">
                        <div>
                            <select id="search_type">
                                <option value="cu">ContentUnits</option>
                                <option value="su">StorageUnits</option>
                            </select>
                        </div>

                        <input type="button" value="${tr("content.search_noun")}">
                    </div>
                </div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        const act = await Executable.getFromName("executables.acts.ContentUnits.Search")
        input_block.setParams(container.node, act.args)

        const items = await list.fetch({})
        list.insert(items, container.node.find(".container_items"))

        container.node.find("#_search input").on("click", async (e) => {
            const _new = input_block.collect()
            list.clear(container.node.find(".container_items"))
            const _new_items = await list.fetch(_new)

            list.insert(_new_items, container.node.find(".container_items"))
        })

        container.node.on("click", ".show_more", async (e) => {
            const target = u(e.target)
            let last_item = list.items[list.items.length - 1]
            let offset = 0

            const _ok = () => {
                ShowMoreObserver.unobserve(target.nodes[0])
                target.remove()
            }

            if (last_item) {
                offset = last_item.data.id
            } else {
                _ok()
            }

            target.addClass('unclickable')

            const new_items = await list.next(offset)

            _ok()

            list.insert(new_items, container.node.find(".container_items"))
        })
    }

    async page() {
        const uuids = router.url.getParam('uuids')
        const ids = uuids.split(',')
        const units = await ContentUnit.fromIds(ids)

        const _u = u(`
            <div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        units.forEach(unit => {
            _u.find(".container_items").append((new ContentUnitSmallViewModel).render(unit))
        })

        if (units.length == 1) {
            u("#side").html("")

            const jsonViewer = create_json_viewer()
            jsonViewer.data = units[0].data.content

            u("#side").append(jsonViewer)
        }

        app.content_side.set(_u.html())
        app.content_side.title(tr("content_units"))
    }
}

export default ContentController

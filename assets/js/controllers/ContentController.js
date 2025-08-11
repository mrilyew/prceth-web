import app from "../app.js"
import router from "../router.js"
import BaseController from "./BaseController.js"
import ContentUnit from "../models/ContentUnit.js"
import StorageUnit from "../models/StorageUnit.js"
import ContentUnitSmallViewModel from "../view_models/ContentUnitSmallViewModel.js"
import tr from "../langs/locale.js"
import Executable from "../models/Executable.js"
import subparams from "../resources/subparams.js"
import ShowMoreObserver from "../ui/observers/ShowMoreObserver.js"
import StorageUnitViewModel from "../view_models/StorageUnitViewModel.js"

export class ContentController extends BaseController {
    async main(container) {
        const url_params = Object.fromEntries(router.url.hashParams.entries())

        const list = new class {
            total_count = 0
            items = []
            type = "cu"
            params = {}

            async fetch(params = {}) {
                this.params = params
                let new_items = null

                if (list.type == "cu") {
                    new_items = await ContentUnit.search(params)
                } else {
                    new_items = await StorageUnit.search(params)
                }

                this.items = new_items.items
                this.total_count = new_items.total_count

                return new_items.items
            }

            async next(offset) {
                let new_items = null

                if (list.type == "cu") {
                    new_items = await ContentUnit.search(Object.assign(this.params, {"offset": offset}))
                } else {
                    new_items = await StorageUnit.search(Object.assign(this.params, {"offset": offset}))
                }

                this.items = this.items.concat(new_items.items)

                return new_items.items
            }

            clearBlock(container) {
                container.html("")
            }

            clear(container) {
                this.items = []
                this.clearBlock(container)
            }

            insert(items, container) {
                if (items.length < 1) {
                    container.append(`
                        <div class="empty_block">
                            <span>${tr("content.search.nothing_found")}</span>
                        </div>    
                    `)
                }

                items.forEach(itm => {
                    if (list.type == "cu") {
                        new ContentUnitSmallViewModel(container, itm).render()
                    } else {
                        new StorageUnitViewModel(container, itm).render()
                    }
                })

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

            setParams(_container, args, tab = "cu", default_ref = {}) {
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

                    argument_class.render({
                        "default": default_ref[arg.name]
                    })

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

                        <div>
                            <input id="_reset" type="button" value="${tr("content.search_reset")}">
                            <input id="_run" type="button" value="${tr("content.search_noun")}">
                        </div>
                    </div>
                </div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        const cts = {
            "cu": await Executable.getFromName("executables.acts.ContentUnits.Search"),
            "su": await Executable.getFromName("executables.acts.StorageUnits.Search")
        }

        input_block.setParams(container.node, cts.cu.args, undefined, url_params)

        const items = await list.fetch(url_params)
        list.insert(items, container.node.find(".container_items"))

        container.node.find("#_search #_reset").on("click", async (e) => {
            container.node.find("#container_params #_items").html("")
            input_block.setParams(container.node, cts[list.type].args)
        })

        container.node.find("#_search #_run").on("click", async (e) => {
            const _new = input_block.collect()
            list.items = []

            const _new_items = await list.fetch(_new)

            list.clearBlock(container.node.find(".container_items"))
            list.insert(_new_items, container.node.find(".container_items"))
        })

        container.node.find("#search_type").on("change", async (e) => {
            const val = e.target.value
            if (!["cu", "su"].includes(val)) {
                return
            }

            list.clear(container.node.find("#_items"))
            list.type = val

            input_block.setParams(container.node, cts[val].args)
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

    async page(container) {
        const uuids = router.url.getParam('uuids')
        const ids = uuids.split(',')

        const _u = u(`
            <div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        container.set(_u.html())
        container.title(tr("content.items"))

        const units = await ContentUnit.fromIds(ids)

        units.forEach(unit => {
            new ContentUnitSmallViewModel(container.node.find(".container_items"), unit).render()
        })
    }
}

export default ContentController

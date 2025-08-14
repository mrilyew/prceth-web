import app from "../app.js"
import router from "../router.js"
import BaseController from "./BaseController.js"
import ContentUnit from "../models/ContentUnit.js"
import StorageUnit from "../models/StorageUnit.js"
import ContentUnitSmallViewModel from "../view_models/ContentUnitSmallViewModel.js"
import tr from "../langs/locale.js"
import Executable from "../models/Executable.js"
import subparams from "../resources/subparams.js"
import DefaultList from "../displays/DefaultList.js"
import ShowMoreObserver from "../ui/observers/ShowMoreObserver.js"
import StorageUnitViewModel from "../view_models/StorageUnitViewModel.js"

export class ContentController extends BaseController {
    async main(container) {
        const url_params = Object.fromEntries(router.url.hashParams.entries())

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

        const list = new DefaultList(container.node.find(".container_items"))
        list.class = ContentUnit
        list.view_model = ContentUnitSmallViewModel
        list.continue_button_observers = [ShowMoreObserver]

        const input_block = new class {
            _views = []

            constructor() {
                this.container = container.node
            }

            append_arg(arg) {
                let _u = u(`
                    <div class="container_param">
                        <span>${arg.localized_name}</span>

                        <div class="container_param_value argument_value"></div>
                    </div>
                `)

                switch(arg.name) {
                    case "query":
                        _u = u(`
                            <div id="search_bar" class="container_param single">
                                <div class="container_param_value argument_value"></div>
                            </div>
                        `)
                        break
                }

                return _u
            }

            append_arg_to_container(node) {
                this.container.find("#container_params #_items").append(node)
            }

            append_subparam(arg, node, ref) {
                if (ref[arg.name]) {
                    arg.data["current"] = ref[arg.name]
                }

                const argument_class_i = subparams[arg.type]
                const argument_class = new argument_class_i(node.find(".container_param_value"), arg)

                argument_class.render({})

                this._views.push(argument_class)
            }

            clear_params() {
                this.container.find("#container_params #_items").html("")

                this._views = []
            }

            set_params(args, ref = {}) {
                args.forEach(arg => {
                    const _u = this.append_arg(arg)
                    this.append_arg_to_container(_u)
                    this.append_subparam(arg, _u, ref)
                })

                this.container.find("#search_bar input").attr("placeholder", tr("content.search"))
            }

            collect() {
                const out = {}

                this._views.forEach(view => {
                    out[view.data.name] = view.recieveValue()
                })

                return out
            }
        }

        const variants = {
            "current": "cu",
            "cu": {
                "exec": await Executable.getFromName("executables.acts.ContentUnits.Search"),
                "class": ContentUnit,
                "view_model": ContentUnitSmallViewModel
            },
            "su": {
                "exec": await Executable.getFromName("executables.acts.StorageUnits.Search"),
                "class": StorageUnit,
                "view_model": StorageUnitViewModel
            }
        }

        input_block.set_params(variants["cu"].exec.args, url_params)

        await list.fetch_with_insert(url_params)

        container.node.find("#_search #_reset").on("click", async (e) => {
            input_block.clear_params()
            input_block.set_params(container.node, variants[variants.current].args)
        })

        container.node.find("#search_bar ._val").on("keyup", (e) => {
            if (e.key == "Enter") {
                container.node.find("#_search #_run").nodes[0].click()
            }
        })

        container.node.find("#_search #_run").on("click", async (e) => {
            const NEW_ARGUMENTS = input_block.collect()
            list.items_clear()

            const NEW_ITEMS = await list.fetch(NEW_ARGUMENTS)

            list.container_clear()
            list.items_insert(NEW_ITEMS)
            list.container_insert(NEW_ITEMS)
        })

        container.node.find("#search_type").on("change", async (e) => {
            const SEARCH_VALUE = e.target.value
            const SEARCH_DICT = variants[SEARCH_VALUE]
            if (!SEARCH_DICT) {
                return
            }

            list.container_clear()
            list.view_models_clear()
            list.items_clear()

            list.class = SEARCH_DICT["class"]
            list.view_model = SEARCH_DICT["view_model"]
            variants.current = SEARCH_VALUE

            input_block.clear_params()
            input_block.set_params(SEARCH_DICT["exec"].args)
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

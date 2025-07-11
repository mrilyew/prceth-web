import BaseController from "./BaseController.js"
import router from "../router.js"
import app from "../app.js"
import api from "../api.js"
import Executable from "../models/Executable.js"
import subparams from "../utils/subparams.js"
import {create_json_viewer} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ExecutableViewModel from "../view_models/ExecutableViewModel.js"
import ExecutableArgumentViewModel from "../view_models/ExecutableArgumentViewModel.js"

const upper_categories = ["act", "extractor", "representation"]
const createable = ["extractor", "representation"]

export class ExecutableController extends BaseController {
    async list() {
        const _u = u(`
            <div>
                <div class="upper_note"></div>
                <div class="horizontal_mini_tabs volume"></div>
                <div id="container_search">
                    <input placeholder="${tr("searches_by_data")}" id="search_bar" type="search">
                </div>
                <div class="container_items"></div>
            </div>
        `)
        const context = router.url.getParam('cx') ?? null
        const default_for_context = context != "add" ? "act" : "representation"
        const selected_tab = router.url.getParam('tab')

        function drawList(container, list) {
            const categories = []
            list.forEach(el => {
                if (!categories.includes(el.data.category)) {
                    categories.push(el.data.category)
                }
            })

            // creating subcategories
            categories.forEach(cat => {
                container.append(`
                    <div data-cat="${DOMPurify.sanitize(cat)}" class="category">
                        <div class="category_name">${DOMPurify.sanitize(cat)}</div>
                        <div class="category_items"></div>
                    </div>
                `)
                list.forEach(el => {
                    if (el.data.category == cat) {
                        container.find(`.category[data-cat='${DOMPurify.sanitize(cat)}'] .category_items`).append(
                            (new ExecutableViewModel).render(el, {
                                "context": context
                            }
                        ))
                    }
                })
            })
        }

        let current_tab = selected_tab ?? default_for_context
        if (!upper_categories.includes(current_tab)) {
            current_tab = default_for_context
        }

        upper_categories.forEach(exec_type => {
            if (context == "add" && !createable.includes(exec_type)) {
                return
            }
            
            const add_this = u(`
                <a data-tab="${exec_type}" href="#exec?tab=${exec_type}">${tr(exec_type + "s_tab")}</a>
            `)

            if (context == "add") {
                add_this.attr("href", `#exec?cx=${context}&tab=${exec_type}`)
            }

            _u.find(".horizontal_mini_tabs").append(add_this)
            if (current_tab == exec_type) {
                _u.find(`.horizontal_mini_tabs a[data-tab="${current_tab}"]`).addClass("selected")
            }
        })

        if (context == "add") {
            _u.find(".upper_note").append(`
                <p>${tr("select_what_we_will_execute")}</p>
            `)
        } else {
            _u.find(".upper_note").remove()
        }

        const executables_list = await Executable.getList(current_tab)
        drawList(_u.find(".container_items"), executables_list)

        app.content_side.set(_u.html())
        app.title(tr("executables_tab"))

        u('#container_search #search_bar').nodes[0].focus()
        u('#container_search').on('input', '#search_bar', (e) => {
            const query = e.target.value
            const itms = executables_list.filter(el => el.data.class_name.toLowerCase().includes(query.toLowerCase()))

            u(".container_items").html('')
            drawList(u(".container_items"), itms)
        })
    }

    async executable() {
        const executable_name = router.url.getParam('name')
        const executable = await Executable.getFromName(executable_name)

        const type = executable.sub
        const category = executable.category
        const name = executable.name
        const variants = executable.data.variants
        const docs = executable.data['docs']
        let full_name = `${type}.${category}.${name}`

        const _u = u(`
            <div>
                <div class="between">
                    <div>
                        <div class="page-head">
                            <b>${DOMPurify.sanitize(docs.name ?? full_name)}</b>
                        </div>
                        <div class="page-subhead">
                            <span>${DOMPurify.sanitize(docs.definition ?? "")}</span>
                        </div>
                        <div id="addit"></div>
                        <div id="args"></div>
                    </div>
                    <div class="page-bottom">
                        <input id="exec" type="button" value="${tr("execute_button")}">
                    </div>
                </div>
            </div>
        `)

        const putArgs = (container, args) => {
            container.html('')

            args.forEach(arg => {
                const param_module = subparams[arg.type]
                if (arg.is_hidden) {
                    return
                }

                const _u = container.append((new ExecutableArgumentViewModel).render(arg, param_module))
                if (param_module) {
                    param_module.post(arg.data, _u.find(`.argument_listitem[data-name='${arg.name}']`))
                }
            })
        }

        if (variants && variants.length > 0) {
            let index = 0

            _u.find("#addit").html(`
                <div class="horizontal_sub_tabs">
                    <a class="selected" data-tab="all">${tr("all")}</a>
                </div>
            `)

            variants.forEach(variant => {
                _u.find("#addit .horizontal_sub_tabs").append(`
                    <a data-tab="${index}">${DOMPurify.sanitize(variant.name)}</a>
                `)

                index+=1
            })
        }

        app.content_side.set(_u.html())
        app.title(DOMPurify.sanitize(full_name))

        putArgs(u('#args'), executable.args)

        function collectArguments(nodes) {
            const vals = {}
            nodes.forEach(nd => {
                const val_node = nd.querySelector('.argument_value')
                const __type = val_node.dataset.type
                const type = subparams[__type]
                const value = type.recieveValue(nd)

                if (Number(nd.dataset.required) == 1) {
                    if (value == null || String(value).length == 0) {
                        type.focus(nd)
                        throw new Error()
                    }
                }

                if (value != undefined) {
                    vals[nd.dataset.name] = value
                }
            })

            return vals
        }

        u("#page #args").on('click', ".argument_listitem .argument_about .argument_listitem_icon", (e) => {
            u(e.target).closest(".argument_listitem").toggleClass('hidden')
        })

        u('#page .horizontal_sub_tabs').on('click', 'a', (e) => {
            const tab = u(e.target)
            const tabs = tab.closest('.horizontal_sub_tabs')
            const index = e.target.dataset.tab

            tabs.find('a').removeClass('selected')
            tab.addClass('selected')

            if (index == 'all') {
                putArgs(u('#args'), executable.args)
            } else {
                const variant = variants[index]
                const list = variant['list']
                const append_list = []
                list.forEach(el => {
                    const l = executable.args.find(item => item.name == el)
                    append_list.push(l)
                })

                putArgs(u('#args'), append_list)
            }

        })

        u(".page-bottom").on('click', '#exec', async (e) => {
            app.up()

            const itms = u('#args .argument_listitem')
            let args = null

            try {
                args = collectArguments(itms.nodes)
            } catch(e) {
                console.error(e)
                return
            }

            u("#side").html("")

            const res = await api.executable(type.slice(0, type.length - 1), `${category}.${name}`, args)
            const jsonViewer = create_json_viewer()
            jsonViewer.data = res

            u("#side").append(jsonViewer)
        })
    }

    async stat() {
        const stat = await api.act({
            "i": "App.Stat"
        })

        app.content_side.set(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>${tr("statistics")}</b>
                <p>${stat.payload.content_units.total_count} units</p>
            </div>
        `)
        app.title(tr("statistics"))
    }
}

export default ExecutableController

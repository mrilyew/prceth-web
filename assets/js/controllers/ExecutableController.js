import BaseController from "./BaseController.js"
import router from "../router.js"
import app from "../app.js"
import api from "../api.js"
import Executable from "../models/Executable.js"
import subparams from "../utils/subparams.js"
import {escapeHtml, create_json_viewer} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ExecutableViewModel from "../view_models/ExecutableViewModel.js"
import ExecutableArgumentViewModel from "../view_models/ExecutableArgumentViewModel.js"

const upper_categories = ["act", "extractor", "representation"]

export class ExecutableController extends BaseController {
    async list() {
        const _u = u(`
            <div>
                <div class="horizontal_mini_tabs volume"></div>
                <div id="container_search">
                    <input placeholder="${tr("searches_by_data")}" id="search_bar" type="search">
                </div>
                <div class="container_items"></div>
            </div>
        `)

        function drawList(container, list) {
            const categories = []
            list.forEach(el => {
                if (!categories.includes(el.data.category)) {
                    categories.push(el.data.category)
                }
            })

            categories.forEach(cat => {
                container.append(`
                    <div data-cat="${escapeHtml(cat)}" class="category">
                        <div class="category_name">${escapeHtml(cat)}</div>
                        <div class="category_items"></div>
                    </div>
                `)
                list.forEach(el => {
                    if (el.data.category == cat) {
                        container.find(`.category[data-cat='${escapeHtml(cat)}'] .category_items`).append((new ExecutableViewModel).render(el))
                    }
                })
            })
        }

        let current_tab = router.url.getParam('tab') ?? "act"
        if (!upper_categories.includes(current_tab)) {
            current_tab = "act"
        }

        const executables_list = await Executable.getList(current_tab)
        upper_categories.forEach(exec_type => {
            _u.find(".horizontal_mini_tabs").append(`
                <a data-tab="${exec_type}" href="#exec?tab=${exec_type}">${tr(exec_type + "s_tab")}</a>
            `)

            if (current_tab == exec_type) {
                _u.find(`.horizontal_mini_tabs a[data-tab="${current_tab}"]`).addClass("selected")
            }
        })

        drawList(_u.find(".container_items"), executables_list)

        app.content_side.set(_u.html())
        app.title(tr("executables_tab"))

        u('#container_search #search_bar').nodes[0].focus()
        u('#container_search').on('input', '#search_bar', (e) => {
            const query = e.target.value
            const itms = executables_list.filter(el => el.data.class_name.toLowerCase().includes(query))

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
        const full_name = `${type}.${category}.${name}`
        const variants = executable.data.variants

        const _u = u(`
            <div>
                <div class="between">
                    <div>
                        <div class="page-head">
                            <b>${escapeHtml(full_name)}</b>
                        </div>
                        <div class="page-subhead">
                            <span>${escapeHtml(executable.docs.definition ?? "")}</span>
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
                param_module.post(arg.data, _u.find(`.argument_listitem[data-name='${arg.name}']`))
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
                    <a data-tab="${index}">${escapeHtml(variant.name)}</a>
                `)

                index+=1
            })
        }

        app.content_side.set(_u.html())
        app.title(escapeHtml(full_name))

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

                vals[nd.dataset.name] = value
                
            })

            return vals
        }

        u("#page #args").on('click', ".argument_listitem .argument_about .common_name", (e) => {
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
}

export default ExecutableController

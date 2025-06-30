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
                <div class="horizontal_mini_tabs"></div>
                <div id="container_search">
                    <input placeholder="${tr("searches_by_data")}" id="search_bar" type="search">
                </div>
                <div id="container_items"></div>
            </div>
        `)

        function drawList(container, list) {
            list.forEach(el => {
                container.append((new ExecutableViewModel).render(el))
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

        drawList(_u.find("#container_items"), executables_list)

        app.content_side.set(_u.html())
        app.title(tr("executables_tab"))

        u('#container_search #search_bar').nodes[0].focus()
        u('#container_search').on('input', '#search_bar', (e) => {
            const query = e.target.value
            const itms = executables_list.filter(el => el.data.class_name.toLowerCase().includes(query))

            u("#container_items").html('')
            drawList(u("#container_items"), itms)
        })
    }

    async executable() {
        const executable_name = router.url.getParam('name')
        const executable = await Executable.getFromName(executable_name)

        const type = executable.sub
        const category = executable.category
        const name = executable.name
        const full_name = `${type}.${category}.${name}`

        const _u = u(`
            <div>
                <div class="page-head">
                    <b>${escapeHtml(full_name)}</b>
                </div>
                <div class="page-subhead">
                    <span>${escapeHtml(executable.docs.definition ?? "")}</span>
                </div>
                <div id="args"></div>
                <div class="page-bottom">
                    <input id="exec" type="button" value="${tr("execute_button")}">
                </div>
            </div>
        `)

        executable.args.forEach(arg => {
            if (arg.is_hidden) {
                return
            }

            _u.find("#args").append((new ExecutableArgumentViewModel).render(arg, subparams[arg.type]))
        })

        app.content_side.set(_u.html())
        app.title(escapeHtml(full_name))

        function collectArguments(nodes) {
            const vals = {}
            nodes.forEach(nd => {
                const val_node = nd.querySelector('.argument_value')
                const __type = val_node.dataset.type
                vals[nd.dataset.name] = subparams[__type].recieveValue(nd)
            })

            return vals
        }

        u(".page-bottom").on('click', '#exec', async (e) => {
            app.up()

            const itms = u('#args .argument_listitem')
            const args = collectArguments(itms.nodes)

            u("#side").html("")

            const res = await api.executable(type.slice(0, type.length - 1), `${category}.${name}`, args)
            const jsonViewer = create_json_viewer()
            jsonViewer.data = res

            u("#side").append(jsonViewer)
        })
    }
}

export default ExecutableController

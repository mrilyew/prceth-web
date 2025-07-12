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
    async list(container) {
        const context = router.url.getParam('cx') ?? null
        const default_for_context = context != "add" ? "act" : "representation"
        const selected_tab = router.url.getParam('tab')

        let current_tab = selected_tab ?? default_for_context
        if (!upper_categories.includes(current_tab)) {
            current_tab = default_for_context
        }

        const ui_list = new class {
            getCategories(list) {
                const categories = []
                list.forEach(el => {
                    if (!categories.includes(el.data.category)) {
                        categories.push(el.data.category)
                    }
                })

                return categories
            }

            draw(cont, list) {
                const categories = this.getCategories(list)

                // creating categories tabs
                categories.forEach(current_category => {
                    cont.append(`
                        <div data-cat="${DOMPurify.sanitize(current_category)}" class="category">
                            <div class="category_name">${DOMPurify.sanitize(current_category)}</div>
                            <div class="category_items"></div>
                        </div>
                    `)
                    // now adding items to categories
                    list.forEach(el => {
                        const element_category = el.data.category
                        if (element_category == current_category) {
                            const new_view = (new ExecutableViewModel).render(el, {"context": context})
                            cont.find(`.category[data-cat='${DOMPurify.sanitize(current_category)}'] .category_items`).append(new_view)
                        }
                    })
                })
            }
        }
        const ui_upper = new class {
            draw(types, current_context, tabs_node) {
                types.forEach(mtype => {
                    if (current_context == "add" && !createable.includes(mtype)) {
                        return
                    }

                    const add_this = u(`
                        <a data-tab="${mtype}" href="#${router.url.getHash()}?tab=${mtype}">${tr("executables." + mtype + "s")}</a>
                    `)

                    if (current_context == "add") {
                        add_this.attr("href", `#${router.url.getHash()}?cx=${current_context}&tab=${mtype}`)
                    }

                    tabs_node.append(add_this)
                    if (current_tab == mtype) {
                        tabs_node.find(`a[data-tab="${current_tab}"]`).addClass("selected")
                    }
                })
            }
        }
        const ui_upper_note = new class {
            addition_text(node) {
                node.append(`
                    <p>${tr("executables.sign")}</p>
                `)
            }

            remove(node) {
                node.remove()
            }
        }

        const executables_list = await Executable.getList(current_tab)
        const _u = u(`
            <div>
                <div class="upper_note"></div>
                <div class="horizontal_mini_tabs volume"></div>
                <div id="container_search">
                    <input placeholder="${tr("content.search_tip")}" id="search_bar" type="search">
                </div>
                <div class="container_items"></div>
            </div>
        `)

        ui_list.draw(_u.find(".container_items"), executables_list)
        ui_upper.draw(upper_categories, context, _u.find(".horizontal_mini_tabs"))
        if (context == "add") {
            ui_upper_note.addition_text(_u.find(".upper_note"))
        } else {
            ui_upper_note.remove(_u.find(".upper_note"))
        }

        container.set(_u.html())
        container.title(tr("nav.executables"))

        u('#container_search #search_bar').nodes[0].focus()
        u('#container_search').on('input', '#search_bar', (e) => {
            const query = e.target.value
            const itms = executables_list.filter(el => el.data.class_name.toLowerCase().includes(query.toLowerCase()))

            u(".container_items").html('')
            ui_list.draw(u(".container_items"), itms)
        })
    }

    list_loader(container) {
        if (u('.container_items').length > 0) {
            u('.container_items').html(`<div class="placeholder"></div>`)
        } else {
            this.loader(container)
        }
    }

    async executable(container) {
        const executable_name = router.url.getParam('name')
        const context = router.url.getParam('context')
        const executable = await Executable.getFromName(executable_name)

        const type = executable.sub
        const category = executable.category
        const name = executable.name
        const variants = executable.data.variants
        const executable_type = type.slice(0, type.length - 1)
        const docs = executable.data['docs']
        let extra_ext = null
        let full_name = `${type}.${category}.${name}`

        if (context == 'add') {
            extra_ext = await Executable.getFromType(executable_type)
        }

        const args = new class {
            putArgs(container, args) {
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

            putVariants(node, variants) {
                let index = 0

                node.html(`
                    <div class="horizontal_sub_tabs">
                        <a class="selected" data-tab="all">${tr("executables.args.all")}</a>
                    </div>
                `)

                variants.forEach(variant => {
                    node.find(".horizontal_sub_tabs").append(`
                        <a data-tab="${index}">${DOMPurify.sanitize(variant.name)}</a>
                    `)

                    index+=1
                })
            }

            collect(nodes) {
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
        }

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
                        <input id="exec" type="button" value="${tr("executables.execute")}">
                    </div>
                </div>
            </div>
        `)

        if (variants && variants.length > 0) {
            args.putVariants(_u.find("#addit"), variants)
        }

        container.set(_u.html())
        container.title(DOMPurify.sanitize(full_name))

        args.putArgs(u('#args'), executable.args)

        if (extra_ext) {
            args.putArgs(u('#args'), extra_ext.args.slice(1))
        }

        // Argument visual toggler
        u("#page #args").on('click', ".argument_listitem .argument_about .argument_listitem_icon", (e) => {
            u(e.target).closest(".argument_listitem").toggleClass('hidden')
        })

        // If there are defined argument lists
        u('#page .horizontal_sub_tabs').on('click', 'a', (e) => {
            const tab = u(e.target)
            const tabs = tab.closest('.horizontal_sub_tabs')
            const index = e.target.dataset.tab

            tabs.find('a').removeClass('selected')
            tab.addClass('selected')

            u('#args').html('')

            if (index == 'all') {
                args.putArgs(u('#args'), executable.args)
            } else {
                const variant = variants[index]
                const list = variant['list']
                const append_list = []
                list.forEach(el => {
                    const l = executable.args.find(item => item.name == el)
                    append_list.push(l)
                })

                args.putArgs(u('#args'), append_list)
            }
        })

        // Run button
        u(".page-bottom").on('click', '#exec', async (e) => {
            app.up()

            const itms = u('#args .argument_listitem')
            let out_args = null

            try {
                out_args = args.collect(itms.nodes)
            } catch(e) {
                console.error(e)
                return
            }

            app.another_side.set("")

            const res = await api.executable(executable_type, `${category}.${name}`, out_args)
            const jsonViewer = create_json_viewer()
            jsonViewer.data = res

            app.another_side.node.append(jsonViewer)
        })
    }
}

export default ExecutableController

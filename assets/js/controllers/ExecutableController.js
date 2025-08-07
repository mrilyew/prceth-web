import BaseController from "./BaseController.js"
import router from "../router.js"
import app from "../app.js"
import api from "../api.js"
import Executable from "../models/Executable.js"
import subparams from "../resources/subparams.js"
import {create_json_viewer, escapeHtml} from "../utils/utils.js"
import {tr, tr_fallback} from "../langs/locale.js"
import ExecutableViewModel from "../view_models/ExecutableViewModel.js"
import ExecutableArgumentViewModel from "../view_models/ExecutableArgumentViewModel.js"
import ExecutableArgument from "../models/ExecutableArgument.js"

const upper_categories = ["act", "extractor", "representation"]
const createable = ["extractor", "representation"]

export class ExecutableController extends BaseController {
    async list(container) {
        const context = router.url.getParam('cx') ?? null
        const selected_tab = router.url.getParam('tab')
        const default_for_context = context != "add" ? "act" : "representation"

        let current_tab = selected_tab ?? default_for_context
        if (!upper_categories.includes(current_tab)) {
            current_tab = default_for_context
        }

        const ui_list = new class {
            getCategories(list) {
                const categories = []
                list.forEach(el => {
                    if (!categories.includes(el.category)) {
                        categories.push(el.category)
                    }
                })

                return categories
            }

            draw(cont, list) {
                const categories = this.getCategories(list)

                cont.find(".placeholder").remove()

                // creating categories tabs
                categories.forEach(current_category => {
                    const current_category_name = tr_fallback("executables.category."+current_category, current_category)

                    cont.append(`
                        <div data-cat="${escapeHtml(current_category)}" class="category">
                            <div class="category_name">${escapeHtml(current_category_name)}</div>
                            <div class="category_items"></div>
                        </div>
                    `)
                    // now adding items to categories
                    list.forEach(el => {
                        const element_category = el.data.category
                        if (element_category == current_category) {
                            new ExecutableViewModel(cont, el).render({"context": context})
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

        if (context == "add") {
            ui_upper_note.addition_text(_u.find(".upper_note"))
        } else {
            ui_upper_note.remove(_u.find(".upper_note"))
        }

        container.set(_u.html())
        container.title(tr("nav.executables"))

        ui_upper.draw(upper_categories, context, container.node.find(".horizontal_mini_tabs"))

        const executables_list = await Executable.getList(current_tab)

        ui_list.draw(container.node.find(".container_items"), executables_list)

        container.node.find('#container_search #search_bar').nodes[0].focus()
        container.node.find('#container_search').on('input', '#search_bar', (e) => {
            const query = e.target.value
            const itms = executables_list.filter(el => {
                let found = false
                const blocks = [el.full_name, el.localized_name]
                blocks.forEach(_el => {
                    if (found) {
                        return
                    }

                    found = _el.toLowerCase().includes(query.toLowerCase())
                })

                return found
            })

            container.node.find(".container_items").html('')
            ui_list.draw(container.node.find(".container_items"), itms)
        })
    }

    list_loader(container) {
        setTimeout(() => {
            if (container.node.hasClass("currently_switching")) {
                if (container.node.find('.container_items').length > 0) {
                    container.node.find('.container_items').html(`<div class="placeholder"></div>`)
                } else {
                    this.loader(container)
                }
            }
        }, 200)
    }

    async executable(container) {
        const executable_name = router.url.getParam('name')
        const context = router.url.getParam('context')
        const executable = await Executable.getFromName(executable_name)

        const type = executable.sub
        const category = executable.category
        const name = executable.name
        const executable_type = type.slice(0, type.length - 1)
        const docs = executable.data['docs']
        let models = []
        let extra_ext = null
        let full_name = `${type}.${category}.${name}`

        if (context == 'add') {
            extra_ext = await Executable.getFromType(executable_type)
        }

        const args = new class {
            constructor() {
                this.items = executable.args ?? []
                if (extra_ext) {
                    this.items = this.items.concat(extra_ext.args.slice(1))
                }
            }

            fromConfirmation(items) {
                let out = []

                items.forEach(item => {
                    out.push(new ExecutableArgument(item))
                })

                if (extra_ext) {
                    out = out.concat(extra_ext.args.slice(1))
                }

                return out
            }

            emptyList() {
                models = []
                u('#args').html('')
            }

            putArgs(container, args) {
                args.forEach(arg => {
                    if (arg.is_hidden) {
                        return
                    }

                    const modl = (new ExecutableArgumentViewModel(container, arg))
                    modl.render({})

                    models.push(modl)
                })
            }

            collect() {
                const vals = {}
                models.forEach(nd => {
                    vals[nd.item.name] = nd.collectValue()
                })

                return vals
            }
        }
        const variants = new class {
            current_tab = null

            constructor() {
                this.items = executable.data.variants ?? []
                // fffffuuuu
                const names = []
                Object.values(args.items).forEach(itm => {
                    if (executable.confirmation.includes(itm.name)) {
                        return
                    }

                    names.push(itm.name)
                })

                if (executable.confirmation.length > 0) {
                    this.items.push({
                        "name": tr("executables.args.short"),
                        "list": executable.confirmation,
                        "is_confirm": true
                    })
                }

                this.items.push({
                    "name": tr("executables.args.all"),
                    "list": names
                })
            }

            renderTabs(container) {
                container.html(`
                    <div class="horizontal_sub_tabs"></div>
                `)

                this.items.forEach(variant => {
                    const _u = u(`<a>${escapeHtml(variant.name)}</a>`)
                    container.find(".horizontal_sub_tabs").append(_u)

                    variant["node"] = _u

                    _u.on('click', (e) => {
                        args.emptyList()
                        this.selectTab(variant)
                    })
                })
            }

            selectTab(variant) {
                const tab = variant.node

                if (tab) {
                    const tabs = tab.closest('.horizontal_sub_tabs')

                    tabs.find('a').removeClass('selected')
                    tab.addClass('selected')
                }

                const list = variant.list
                const append_list = []

                list.forEach(el => {
                    const l = args.items.find(item => item.name == el)
                    append_list.push(l)
                })

                args.putArgs(u('#args'), append_list)

                this.current_tab = variant
            }
        }

        const _u = u(`
            <div>
                <div class="between">
                    <div>
                        <div class="page-head volume">
                            <b>${DOMPurify.sanitize(docs.name ?? full_name)}</b>
                        </div>
                        <div class="page-subhead">
                            <span>${DOMPurify.sanitize(docs.definition ?? "")}</span>
                        </div>
                        <div id="addit"></div>
                        <div id="args"></div>
                    </div>
                    <div class="page-bottom">
                        <input class="wide_button" id="exec" type="button" value="${tr("executables.execute")}">
                    </div>
                </div>
            </div>
        `)

        container.set(_u.html())
        container.title(DOMPurify.sanitize(full_name))

        if (variants.items.length > 1) {
            variants.renderTabs(container.node.find("#addit"))
        }

        args.emptyList()

        //const select_id = variants.items.length - 1
        const select_id = 0
        variants.selectTab(variants.items[select_id])

        // Run button
        u(".page-bottom").on('click', '#exec', async (e) => {
            const is_confirmation = variants.current_tab.is_confirm
            const target = u(e.target)

            target.addClass("unclickable")

            app.up()

            const itms = u('#args .argument_listitem')
            let out_args = null

            try {
                out_args = args.collect()
            } catch(e) {
                return
            }

            if (is_confirmation) {
                out_args["confirm"] = 0
            }

            app.another_side.set("")

            let res = null

            try {
                res = await api.executable(executable_type, `${category}.${name}`, out_args)
            } catch(e) {
                target.removeClass("unclickable")
                console.error(e)

                return
            }

            if (is_confirmation) {
                const __args = args.fromConfirmation(res.tab)

                args.emptyList()
                args.putArgs(u("#args"), __args)
            } else {
                const jsonViewer = create_json_viewer()
                jsonViewer.data = res

                app.another_side.node.append(jsonViewer)
            }

            target.removeClass("unclickable")
        })
    }
}

export default ExecutableController

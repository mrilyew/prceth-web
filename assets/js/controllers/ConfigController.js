import BaseController from "./BaseController.js"
import { escapeHtml } from "../utils/utils.js"
import tr from "../langs/locale.js"
import ExecutableArgumentViewModel from "../view_models/ExecutableArgumentViewModel.js"
import ExecutableArgument from "../models/ExecutableArgument.js"
import router from "../router.js"
import Config from "../models/Config.js"

class ConfigController extends BaseController {
    error_page(container, message) {
        container.node.find("#header").html(`
            <div id="editing_disabled">
                <span>${message}</span>
            </div>
        `)
        container.node.find(".page-bottom").remove()
    }

    async index(container) {
        let locked = false
        const selected_tab = router.url.getParam('tab') ?? "same"

        if (selected_tab == "same") {
            container.title(tr("config.page.title"))
        } else {
            container.title(tr("config.page.env.title"))
        }

        container.set(`
            <div id="config_page">
                <div class="horizontal_sub_tabs">
                    <a href="#config?tab=same" data-tab="same">${tr("config.name")}</a>
                    <a href="#config?tab=env" data-tab="env">${tr("config.env")}</a>
                </div>
                <div id="header">
                    <span>${tr("config.mention.missing_params")}</span>
                </div>

                <div id="items"></div>

                <div class="page-bottom">
                    <input class="wide_button" id="save" type="button" value="${tr("config.save")}">
                </div>
            </div>
        `)

        container.node.find(`.horizontal_sub_tabs a[data-tab="${selected_tab}"]`).addClass("selected")

        switch (selected_tab) {
            case "same":
                await this.config_page(container)

                break
            case "env":
                await this.env_page(container)

                break
        }
    }

    async config_page(container) {
        let config_items = null
        let argument_models = []

        try {
            config_items = await Config.list()
        } catch(e) {
            this.error_page(container, e.message)

            return
        }

        Config.categories_from_args(config_items).forEach(el => {
            container.node.find("#config_page #items").append(`
                <div class="category" data-category="${el}">
                    <div class="category_name">
                        <b>${escapeHtml(tr("config.category."+el))}</b>
                    </div>

                    <div class="items"></div>
                </div>
            `)
        })

        config_items.forEach(el => {
            const category = el.name.split(".")[0]
            const __category_container = container.node.find(`#config_page #items .category[data-category="${category}"] .items`)

            const _r_mdl = new ExecutableArgumentViewModel(__category_container, new ExecutableArgument(el))
            _r_mdl.render({})

            argument_models.push(_r_mdl)
        })

        container.node.on("click", "#save", async (e) => {
            u(e.target).addClass("unclickable")

            const so_values = {}

            argument_models.forEach(arg => {
                so_values[arg.item.name] = arg.collectValue()
            })

            u(e.target).removeClass("unclickable")

            await Config.update(so_values)

            router.go_to("config")
        })
    }

    async env_page(container) {
        let env_items = null

        container.node.find("#header").remove()
        container.node.find("#items").html(`
            <div id="env_table"></div>
            <div id="env_add" class="env_element">
                <input type="text" placeholder="...">
                <div style="width:105%"></div>
            </div>
        `)

        try {
            env_items = await Config.env_list()
        } catch(e) {
            this.error_page(container, e.message)

            return
        }

        const add_item = (name, value) => {
            const _u = u(`
                <div class="env_element">
                    <input data-val="name" type="text" value="${name}">
                    <input data-val="value" type="text" value="${value}">
                </div>
            `)
            container.node.find("#items #env_table").append(_u)
            _u.find("input[data-val='name']").nodes[0].focus()
        }

        Object.entries(env_items).forEach(el => {
            add_item(el[0], el[1])
        })

        container.node.find("#env_add").on("click", "input", (e) => {
            add_item("", "")
        })

        container.node.on("keydown", "#env_table .env_element input", (e) => {
            if (e.key == 'Backspace' && e.target.value.length == 0) {
                const item_container = u(e.target).closest(".env_element")
                if (item_container.nodes[0].previousSibling) {
                    item_container.nodes[0].previousSibling.querySelector("input").focus()
                    item_container.remove()
                }
            }
        })

        container.node.on("click", "#save", async (e) => {
            u(e.target).addClass("unclickable")

            const so_values = {}

            u("#env_table .env_element").nodes.forEach(argument => {
                const env_name = u(argument).find(`input[data-val="name"]`).nodes[0].value
                const env_value = u(argument).find(`input[data-val="value"]`).nodes[0].value

                if (env_name == "" || env_value == "") {
                    return
                }

                so_values[env_name] = env_value
            })

            u(e.target).removeClass("unclickable")

            await Config.update_env(so_values)

            router.go_to("config?tab=env")
        })
    }
}

export default ConfigController

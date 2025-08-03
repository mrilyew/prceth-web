import BaseController from "./BaseController.js"
import api from "../api.js"
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
    }

    async index(container) {
        let locked = false
        const selected_tab = router.url.getParam('tab') ?? "same"

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

        u("#config_page").on("click", "#save", async (e) => {
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
}

export default ConfigController

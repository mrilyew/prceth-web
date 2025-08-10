import {proc_strtr, escapeHtml} from "../utils/utils.js"
import ViewModel from "./ViewModel.js"

class ExecutableViewModel extends ViewModel {
    render(args) {
        const context = args['context']
        let link = `#execute?name=${escapeHtml(this.item.class_name)}`
        let display_name = this.item.localized_name
        if (args.original_name) {
            display_name = this.item.full_name
        }

        if (context) {
            link += `&context=${context}`
        }

        const _el = u(`
            <div class="scroll_element no_overflow">
                <a href="${link}" class="scroll_element_title">
                    <div class="name">
                        <b>${proc_strtr(escapeHtml(display_name), 500)}</b>
                    </div>

                    <div class="toggle_block"><div class="toggle_icon"></div></div>
                </a>
                <div class="data">
                    <div class="data_description">
                        ${escapeHtml(this.item.description ?? "no description")}
                    </div>
                    <div class="data_args"></div>
                </div>
            </div>
        `)

        this.item.args.forEach(el => {
            const localized_name = el.localized_name
            const orig_name = el.name

            _el.find(".data_args").append(`
                <div class="data_arg">
                    <div class="list_block"></div>
                    <span><b>${escapeHtml(localized_name)}</b>${escapeHtml(localized_name != orig_name ? " (" + orig_name + ")" : "")}</span>
                </div>
            `)
        })

        this.container.append(_el)
        this.node = _el

        _el.on("click", ".toggle_block", (e) => {
            e.preventDefault()

            u(e.target).closest(".scroll_element").toggleClass("shown")
        })

        return _el
    }
}

export default ExecutableViewModel

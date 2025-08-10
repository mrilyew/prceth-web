import {proc_strtr, escapeHtml, create_json_viewer} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ViewModel from "./ViewModel.js"
import FloatingWindow from "../ui/FloatingWindow.js"

class ContentUnitSmallViewModel extends ViewModel {
    render(args) {
        const data = this.item.data
        const display_name = data.display_name
        const representation_name = data.representation
        const description = data.description
        const _u = u(`
            <div class="content_unit_item scroll_element">
                <a href="#cu?uuids=${data.id}" class="scroll_element_title">
                    <div class="name">
                        <b class="no_overflow">${proc_strtr(escapeHtml(display_name), 50)}</b>
                        <div class="representation_name">
                            <span>${escapeHtml(representation_name)}</span>
                        </div>
                    </div>

                    <div class="toggle_block"><div class="toggle_icon"></div></div>
                </a>
                <div class="data">
                    <div class="data_table flex"></div>
                </div>
            </div>
        `)

        if (display_name && display_name.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.display_name')}</b>
                    <span>${escapeHtml(display_name)}</span>
                </div>
            `)
        }
    
        if (description && description.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.description')}</b>
                    <span>${DOMPurify.sanitize(description)}</span>
                </div>
            `)
        }

        _u.find(".data_table").append(`
            <div class="data_table_column">
                <b>${tr('content.actions')}</b>
                <div>
                    <input type="button" id="_show_json_button" value="${tr("content.actions.show_json")}">
                </div>
            </div>
        `)

        this.container.append(_u)
        this.node = _u

        _u.find(".toggle_block").on("click", (e) => {
            e.preventDefault()

            u(e.target).closest(".scroll_element").toggleClass("shown")
        })

        _u.find("#_show_json_button").on("click", (e) => {
            const jsonViewer = create_json_viewer()
            jsonViewer.data = data.content

            const float = FloatingWindow.openWDups(`json_${data.id}`)

            float.move(e.clientX, e.clientY)

            float.container.node.append(jsonViewer)
            float.container.title(`JSON ${data.id}`)
        })

        return _u
    }
}

export default ContentUnitSmallViewModel

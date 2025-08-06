import {proc_strtr, escapeHtml} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ViewModel from "./ViewModel.js"

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
                    <input type="button" value="${tr("content.actions.show_json")}">
                </div>
            </div>
        `)

        this.container.append(_u)
        this.node = _u

        return _u
    }
}

export default ContentUnitSmallViewModel

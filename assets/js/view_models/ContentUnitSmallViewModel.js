import {proc_strtr, escapeHtml} from "../utils/utils.js"
import tr from "../langs/locale.js"

class ContentUnitSmallViewModel {
    render(i) {
        const data = i.data
        const description = data.description
        const _u = u(`
            <div class="content_unit_item scroll_element">
                <a href="#cu?uuids=${data.id}" class="content_unit_item_title">
                    <div class="name">
                        <b class="no_overflow">${proc_strtr(escapeHtml(data.display_name), 50)}</b>
                        <div class="representation_name">
                            <span>${escapeHtml(data.representation)}</span>
                        </div>
                    </div>

                    <div class="toggle_icon"></div>
                </a>
                <div class="data">
                    <div class="data_table flex"></div>
                </div>
            </div>
        `)

        if (description && description.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_row">
                    <b>${tr('content.description')}</b>
                    <span>${DOMPurify.sanitize(description)}</span>
                </div>
            `)
        }

        return _u
    }
}

export default ContentUnitSmallViewModel

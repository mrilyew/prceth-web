import {proc_strtr, escapeHtml} from "../utils/utils.js"

class ContentUnitSmallViewModel {
    render(i) {
        const data = i.data

        return u(`
            <a href="#cu?uuids=${data.id}" class="content_unit_element scroll_element">
                <b>${proc_strtr(escapeHtml(data.display_name), 50)}</b>
                <div class="content_unit_representation">
                    <span>${escapeHtml(data.representation)}</span>
                </div>
            </a>
        `)
    }
}

export default ContentUnitSmallViewModel

import {proc_strtr, escapeHtml} from "../utils/utils.js"

class ExecutableArgumentViewModel {
    render(i, argument_class) {
        const data = i.data

        const _f = u(`
            <div class="argument_listitem" data-name="${escapeHtml(data.name)}">
                <div class="argument_about">
                    <div class="name">
                        <div class="name_place"></div>
                        <div class="argument_listitem_icon"></div>
                    </div>
                </div>
                <div class="argument_value"></div>
            </div>
        `)

        const has_docs = data.docs != null
        const has_described_name = has_docs && data.docs.name != null
        const has_class = argument_class != null
        const is_required = i.is_required

        if (has_described_name) {
            _f.find(".argument_about .name_place").append(`<span class="common_name"><b>${escapeHtml(data.docs.name)}</b></span><b class="redded">&nbsp;${proc_strtr(escapeHtml(data.name), 500)}</b>`)
        } else {
            _f.find(".argument_about .name_place").append(`<span class="common_name"><b>${proc_strtr(escapeHtml(data.name), 500)}</b></span>`)
        }

        if (has_docs) {
            _f.find('.argument_about').append(`
                <p class="desc">${data.docs.definition ?? ''}</p>
            `)
        }

        if (has_class) {
            _f.find(".argument_value").append(argument_class.renderValue(data)).attr("data-type", data.type)
        }

        if (is_required) {
            _f.attr("data-required", "1")
            _f.find(".argument_about .common_name").append(`<span>*</span>`)
        }

        return _f
    }
}

export default ExecutableArgumentViewModel

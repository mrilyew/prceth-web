import {proc_strtr, escapeHtml} from "../utils/utils.js"

class ExecutableArgumentViewModel {
    template(data, argument_class) {
        const _f = u(`
            <div class="argument_listitem" data-name="${escapeHtml(data.name)}">
                <div class="argument_about">
                    <div class="name"></div>
                </div>
                <div class="argument_value"></div>
            </div>
        `)

        const has_docs = data.docs != null
        const has_described_name = has_docs && data.docs.name != null
        const has_class = argument_class != null

        if (has_described_name) {
            _f.find(".argument_about .name").append(`<b>${escapeHtml(data.docs.name)}</b><b class="grayed">&nbsp;${proc_strtr(escapeHtml(data.name), 500)}</b>`)
        } else {
            _f.find(".argument_about .name").append(`<b>${proc_strtr(escapeHtml(data.name), 500)}</b>`)
        }

        if (has_docs) {
            _f.find('.argument_about').append(`
                <p>${data.docs.definition ?? ''}</p>
            `)
        }

        if (has_class) {
            _f.find(".argument_value").append(argument_class.renderValue(data)).attr("data-type", data.type)
        }

        return _f
    }
}

export default ExecutableArgumentViewModel

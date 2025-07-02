import {proc_strtr, escapeHtml} from "../utils/utils.js"

class ExecutableViewModel {
    render(i, args) {
        const data = i.data
        const context = args['context']
        let link = `#execute?name=${escapeHtml(data.class_name)}`

        if (context) {
            link += `&context=${context}`
        }

        return u(`
            <a href="${link}" class="scroll_element no_overflow">
                <b>${proc_strtr(escapeHtml(data.category + '.' + data.name), 500)}</b>
            </a>
        `)
    }
}

export default ExecutableViewModel

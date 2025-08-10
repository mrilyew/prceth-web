import {proc_strtr, escapeHtml, simple_data} from "../utils/utils.js"

class LogViewModel {
    render(container, i, args = {}) {
        const date = simple_data(i.time)

        const template = u(`
            <div class="log">
                <div class="head">
                    <div class="name">
                        <b>${escapeHtml(i.section)}</b>
                        <span>(${i.kind})</span>
                    </div>
                    <div class="time">
                        <span>${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}</span>
                        <span>${String(date.hour).padStart(2, "0")}:${String(date.minutes).padStart(2, "0")}:${String(date.seconds).padStart(2, "0")}</span>
                    </div>
                </div>
                <div class="body">
                    ${escapeHtml(i.message)}
                </div>
            </div>
        `)

        container.append(template)
    }
}

export default LogViewModel

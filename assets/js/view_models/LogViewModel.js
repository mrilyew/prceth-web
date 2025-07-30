import {proc_strtr, escapeHtml} from "../utils/utils.js"

class LogViewModel {
    render(container, i, args = {}) {
        const date = new Date(i.time * 1000)

        const month = (date.getMonth() + 1)
        const day = date.getDate()
        const hour = date.getHours()
        const minutes = date.getMinutes()
        const seconds = date.getSeconds()

        const template = u(`
            <div class="log">
                <div class="head">
                    <div class="name">
                        <b>${escapeHtml(i.section)}</b>
                        <span>(${i.kind})</span>
                    </div>
                    <div class="time">
                        <span>${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}</span>
                        <span>${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}</span>
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

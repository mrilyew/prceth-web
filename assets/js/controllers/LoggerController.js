import BaseController from "./BaseController.js"
import app from "../app.js"
import LogViewModel from "../view_models/LogViewModel.js"
import tr from "../langs/locale.js"
import { escapeHtml } from "../utils/utils.js"

class LoggerController extends BaseController {
    async index(container) {
        container.set(`
            <div id="logs_block">
                <div id="logs_settings">
                    <div id="logs_tip">
                        <p>${tr("logger.logs_state")}</p>

                        <p>${tr("logger.logs_state_2")}</p>
                    </div>
                    <div id="logs_options">
                        <label id="show_ignored" class="checkbox_label">
                            <input type="checkbox">
                            ${tr("logger.show_ignored")}
                        </label>
                        <label id="only_section" class="select_label">
                            ${tr("logger.only_section")}

                            <select>
                                <option value="!">---</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div id="logs"></div>
            </div>
        `)
        container.title(tr("nav.logs"))

        let hiddeness = false
        let section = null
        let logs_length = app.logs.length

        // Recieving unique list of sections
        const sectionsFromLogs = (logs) => {
            let sections = []
            
            logs.forEach(log => {
                sections.push(log.section)
            })

            return new Set(sections)
        }
        // appending list templates on container
        const drawList = (container, logs, show_hidden = false, only_section = null) => {
            let write_logs = []
            logs.forEach(el => {
                if (el["silent"] && (!show_hidden || only_section != null)) {
                    return
                }

                if (only_section != null && el["section"] != only_section) {
                    return
                }

                write_logs.push(el)
            })

            sectionsFromLogs(app.logs).forEach(section => {
                container.find("#only_section select").append(`
                    <option value="${escapeHtml(section)}">${escapeHtml(section)}</option>    
                `)
            })

            if (write_logs.length == 0) {
                container.find("#logs").append(`
                    <div class="empty_block">
                        <span>${tr("logger.no_logs")}</span>
                    </div>
                `)
            } else {
                container.find(".empty_block").remove()
                write_logs.forEach(el => {
                    (new LogViewModel).render(container.find("#logs"), el)
                })
            }
        }
        const hideList = (container) => {
            container.find("#logs").html("")
        }

        drawList(container.node.find("#logs_block"), app.logs, hiddeness, section)

        const interval = setInterval(() => {
            console.log("Logs update")

            if (u("#logs_block").length == 0) {
                clearInterval(interval)

                return
            }

            if (app.logs.length > logs_length) {
                drawList(container.node.find("#logs"), app.logs.splice(app.logs.length, logs_length), hiddeness)

                logs_length = app.logs.length
            }
        }, 1000)

        u("#logs_block #logs_settings").on("change", "#show_ignored input", (e) => {
            const checked = e.target.checked

            hiddeness = checked

            hideList(container.node)
            drawList(container.node, app.logs, checked)
        })

        u("#logs_block #logs_settings").on("change", "#only_section select", (e) => {
            let val = e.target.value

            if (val == "!") {
                val = null
            }

            hideList(container.node)
            drawList(container.node, app.logs, hiddeness, val)
        })
    }
}

export default LoggerController

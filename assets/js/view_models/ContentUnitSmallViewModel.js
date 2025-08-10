import {proc_strtr, escapeHtml, create_json_viewer} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ViewModel from "./ViewModel.js"
import FloatingWindow from "../ui/FloatingWindow.js"

class ContentUnitSmallViewModel extends ViewModel {
    render(args) {
        const data = this.item.data
        const display_name = data.display_name
        const representation_name = data.representation
        const extractor_name = data.extractor
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

        if (representation_name && representation_name.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.representation_by')}</b>
                    <span>${escapeHtml(representation_name)}</span>
                </div>
            `)
        }

        if (extractor_name && extractor_name.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.extractor_by')}</b>
                    <span>${escapeHtml(extractor_name)}</span>
                </div>
            `)
        }

        if (extractor_name && extractor_name.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.extractor_by')}</b>
                    <span>${escapeHtml(extractor_name)}</span>
                </div>
            `)
        }

        if (extractor_name && extractor_name.length > 0) {
            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr('content.extractor_by')}</b>
                    <span>${escapeHtml(extractor_name)}</span>
                </div>
            `)
        }

        // times
        
        const times_created = data.created
        const times_declared_created = data.declared_created
        let format_name = navigator.language
        let is_equal_dates = Math.trunc(times_declared_created) != Math.trunc(times_created)

        if (times_created) {
            const _date = new Date(times_created * 1000)

            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr("content.created_at")}</b>
                    <span>${_date.toLocaleString(format_name)}</span>
                </div>`)
        }
        
        if (times_declared_created && is_equal_dates) {
            const _date = new Date(times_declared_created * 1000)

            _u.find(".data_table").append(`
                <div class="data_table_column">
                    <b>${tr("content.declared_created_at")}</b>
                    <span>${_date.toLocaleString(format_name)}</span>
                </div>
            `)
        }

        _u.find(".data_table").append(`
            <div class="data_table_column">
                <b>${tr('content.json_data')}</b>
                <div>
                    <input type="button" id="_show_json_button" value="${tr("content.json_data.show_json")}">
                    <input type="button" id="_show_outer_button" value="${tr("content.json_data.show_outer")}">
                    <input type="button" id="_show_source_button" value="${tr("content.json_data.show_source")}">
                </div>
            </div>
        `)

        this.container.append(_u)
        this.node = _u

        _u.find(".toggle_block").on("click", (e) => {
            e.preventDefault()

            u(e.target).closest(".scroll_element").toggleClass("shown")
        })

        function showSomeButton(name, content) {
            const jsonViewer = create_json_viewer()
            jsonViewer.data = content

            const float = FloatingWindow.openWDups(name)

            float.container.node.append(jsonViewer)
            float.container.title(name)

            return float
        }

        _u.find("#_show_json_button").on("click", (e) => {
            showSomeButton(`JSON ${data.id}`, data.content).move(e.clientX, e.clientY)
        })

        _u.find("#_show_outer_button").on("click", (e) => {
            showSomeButton(`Outer ${data.id}`, data.outer).move(e.clientX, e.clientY)
        })

        _u.find("#_show_source_button").on("click", (e) => {
            showSomeButton(`Source ${data.id}`, data.source).move(e.clientX, e.clientY)
        })

        return _u
    }
}

export default ContentUnitSmallViewModel

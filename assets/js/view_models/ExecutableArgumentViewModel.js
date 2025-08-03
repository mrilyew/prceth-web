import {proc_strtr, escapeHtml} from "../utils/utils.js"
import subparams from "../resources/subparams.js"
import ViewModel from "./ViewModel.js"

class ExecutableArgumentViewModel extends ViewModel {
    render(i) {
        const data = this.item.data
        const argument_class = subparams[data.type]

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
            this.argument_class = new argument_class(_f.find(".argument_value"), this.item)
            this.argument_class.render({})

            _f.find(".argument_value").attr("data-type", data.type)
        }

        if (is_required) {
            _f.attr("data-required", "1")
            _f.find(".argument_about .common_name").append(`<span>*</span>`)
        }

        this.container.append(_f)
        this.node = _f

        // Argument visual toggler
        u(_f).on('click', ".argument_about .argument_listitem_icon", (e) => {
            u(e.target).closest(".argument_listitem").toggleClass('hidden')
        })

        return _f
    }

    collectValue() {
        const val_node = this.node.find('.argument_value')
        const __type = val_node.attr("data-type")
        const value = this.argument_class.recieveValue(this.node.nodes[0])

        if (Number(this.node.attr("data-required")) == 1) {
            if (value == null || String(value).length == 0) {
                type.focus(this.node)
                throw new Error()
            }
        }

        if (value != undefined) {
            return value
        }
    }
}

export default ExecutableArgumentViewModel

import {proc_strtr, escapeHtml} from "../utils/utils.js"
import subparams from "../resources/subparams.js"
import ViewModel from "./ViewModel.js"

class FocusError extends Error {}

class ExecutableArgumentViewModel extends ViewModel {
    render(i) {
        const argument_class = subparams[this.item.type]

        const _f = u(`
            <div class="argument_listitem" data-name="${escapeHtml(this.item.name)}">
                <div class="argument_about">
                    <div class="name">
                        <div class="name_place"></div>
                        <div class="argument_listitem_icon"></div>
                    </div>
                </div>
                <div class="argument_value"></div>
            </div>
        `)

        const has_docs = this.item.docs != null
        const has_class = argument_class != null
        const is_required = this.item.is_required

        if (this.item.localized_name) {
            _f.find(".argument_about .name_place").append(`<span class="common_name"><b>${escapeHtml(this.item.localized_name)}</b></span><b class="redded">&nbsp;${proc_strtr(escapeHtml(this.item.name), 500)}</b>`)
        } else {
            _f.find(".argument_about .name_place").append(`<span class="common_name"><b>${proc_strtr(escapeHtml(this.item.name), 500)}</b></span>`)
        }

        if (has_docs) {
            _f.find('.argument_about').append(`
                <p class="desc">${this.item.localized_description ?? ''}</p>
            `)
        }

        if (has_class) {
            this.argument_class = new argument_class(_f.find(".argument_value"), this.item)
            this.argument_class.render({})

            _f.find(".argument_value").attr("data-type", this.item.type)
        }

        if (is_required && i.required == true) {
            _f.attr("data-required", "1")
            _f.find(".argument_about .common_name").append(`<span>*</span>`)
        }

        this.container.append(_f)
        this.node = _f

        // Argument visual toggler
        _f.on('click', ".argument_about .argument_listitem_icon", (e) => {
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
                this.argument_class.focus()
                throw new FocusError()
            }
        }

        if (value != undefined) {
            return value
        }
    }
}

export default ExecutableArgumentViewModel

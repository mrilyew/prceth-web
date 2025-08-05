import {proc_strtr, escapeHtml} from "../utils/utils.js"
import tr from "../langs/locale.js"
import ExecutableArgument from "../models/ExecutableArgument.js"

class SubArgument {
    constructor(container, data) {
        this.container = container
        this.data = data
    }

    recieveValue() {
        const val = this.node.nodes[0].value
        if (!val) {
            return undefined
        }

        return val
    }

    focus() {
        return this.node.nodes[0].focus()
    }
}

export const subparams = {
    'StringArgument': class StringArgument extends SubArgument {
        render(i) {
            const data = this.data.data

            let _u = u(`
                <input class="_val" type="text">
            `)

            if (data.is_long == true) {
                _u = u(`
                    <textarea class="_val"></textarea>
                `)
            }

            if (this.data.default != null) {
                if (data.is_long != true) {
                    _u.attr("value", this.data.default)
                } else {
                    _u.html(escapeHtml(this.data.default))
                }
            }

            if (data.env_property != null) {
                _u.attr("placeholder", tr("executables.env_value", escapeHtml(data.env_property)))
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }
    },
    'IntArgument': class IntArgument extends SubArgument {
        render(i) {
            const _u = u(`
                <input class="_val" type="number">
            `)

            if (this.data.default != null) {
                _u.attr("value", this.data.default)
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }
    },
    'FloatArgument': class FloatArgument extends SubArgument {
        render(i) {
            const _u = u(`
                <input class="_val" step="0.01" type="number">
            `)

            if (this.data.default != null) {
                _u.attr("value", this.data.default)
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }
    },
    'LimitedArgument': class LimitedArgument extends SubArgument {
        render(i) {
            const keys = this.data.data
            let _u = u(`
                <div class="_val"></div>
            `)

            keys.values.forEach(itm => {
                let name = escapeHtml(itm)

                const keys = this.data.docs.values
                const key  = keys[itm]
                const key_name = key["name"]

                if (this.data.docs && keys && key) {
                    name = key_name
                }

                _u.append(`<label class="block_label"><input type="radio" name="${this.data.name}" value="${escapeHtml(itm)}">${name}</label>`)
            })

            if (this.data.default != null) {
                _u.find(`.block_label input[value='${escapeHtml(this.data.default)}']`).attr("checked", "true")
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }

        recieveValue() {
            return this.node.closest(".argument_value").find('._val input:checked').nodes[0].value
        }
    },
    'BooleanArgument': class BooleanArgument extends SubArgument {
        render(i) {
            let _u = u(`
                <input type="checkbox" class="_val">
            `)

            if (this.data.default == true) {
                _u.attr("checked", "")
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }

        recieveValue() {
            return Number(this.node.closest(".argument_value").find('._val').nodes[0].checked == true)
        }
    },
    'JsonArgument': class JsonArgument extends SubArgument {
        render(i) {
            let _u = u(`
                <textarea class="_val"></textarea>
            `)

            if (this.data.default != null) {
                _u.html(escapeHtml(JSON.stringify(this.data.default)))
            }

            this.container.append(_u)
            this.node = _u

            return _u
        }
    },
    'CsvArgument': class CsvArgument extends SubArgument {
        subs = []

        render(i) {
            let _u = u(`
                <div>
                    <div class="csv_argument">
                        <div style="gap: 7px;" class="column wide _items"></div>
                        <div class="flex" style="gap: 7px;">
                            <input type="button" class="fit act_btn _add_icon" value="+">
                            <input type="button" class="fit act_btn _rem_icon" value="-">
                        </div>
                    </div>
                </div>
            `)

            this.container.append(_u)
            this.node = _u
            this.events(_u)

            return _u
        }
        events(node) {
            const addItem = (preset) => {
                // messy code but ok
                const orig_arg = this.data.original_arg
                const arg_type = orig_arg ? (orig_arg["type"] ?? "StringArgument") : "StringArgument"
                const subparam_class = subparams[arg_type]
                const orig_arg_class = new ExecutableArgument(orig_arg ?? {})
                if (preset) {
                    orig_arg_class.data.default = preset
                }

                const subparam = new subparam_class(node.find('._items'), orig_arg_class)

                subparam.render()
                subparam.focus()

                subparam.node.on('keydown', (e) => {
                    if (e.key == 'Backspace' && this.subs.length > 1) {
                        removeItem(subparam)
                    }
                })

                this.subs.push(subparam)
            }

            const removeItem = (subparam) => {
                subparam.node.remove()
                this.subs = this.subs.filter(item => item !== subparam)

                const prev_node = this.subs[this.subs.length - 1]
                if (prev_node) {
                    prev_node.node.nodes[0].focus()
                }
            }

            const _default = this.data.default ?? ['']
            console.log(_default)
            _default.forEach(item => {
                addItem(item)
            })

            node.on('click', '._add_icon', (e) => {
                addItem('')
            })

            node.on('click', '._rem_icon', (e) => {
                if (this.subs.length > 0) {
                    removeItem(this.subs[this.subs.length - 1])
                }
            })
        }

        recieveValue() {
            const vals = []
            this.subs.forEach(el => {
                const val = el.recieveValue()
                if (!val) {
                    return
                }

                vals.push(val)
            })

            if (vals.length == 0) {
                return undefined
            }

            return JSON.stringify(vals)
        }
    }
}

subparams['ObjectArgument'] = subparams['JsonArgument']
subparams['ContentUnitArgument'] = subparams['StringArgument']

export default subparams

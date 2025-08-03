import {proc_strtr, escapeHtml} from "../utils/utils.js"
import tr from "../langs/locale.js"

class SubArgument {
    constructor(container, data) {
        this.container = container
        this.data = data
    }

    recieveValue(node) {
        return node.querySelector('._val').value
    }

    focus(node) {
        return node.querySelector('._val').focus()
    }
}

export const subparams = {
    'StringArgument': class StringArgument extends SubArgument {
        render(i) {
            let _u = u(`
                <input class="_val" type="text">
            `)

            if (this.data.is_long == true) {
                _u = u(`
                    <textarea class="_val"></textarea>
                `)
            }

            if (this.data.default != null) {
                if (this.data.is_long != true) {
                    _u.attr("value", this.data.default)
                } else {
                    _u.html(escapeHtml(this.data.default))
                }
            }

            if (this.data.env_property != null) {
                _u.attr("placeholder", tr("executables.env_value", escapeHtml(data.env_property)))
            }

            this.container.append(_u)

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

            return _u
        }
    },
    'LimitedArgument': class LimitedArgument extends SubArgument {
        render(i) {
            let _u = u(`
                <div class="_val"></div>
            `)

            this.data.values.forEach(itm => {
                let name = escapeHtml(itm)
                if (this.data.docs && this.data.docs['values'] && this.data.docs.values[itm]) {
                    name = this.data.docs.values[itm]
                }

                _u.append(`<label class="block_label"><input type="radio" name="${this.data.name}" value="${escapeHtml(itm)}">${name}</label>`)
            })

            if (this.data.default != null) {
                _u.find(`.block_label input[value='${escapeHtml(this.data.default)}']`).attr("checked", "true")
            }

            this.container.append(_u)

            return _u
        }

        recieveValue(node) {
            return node.querySelector('._val input:checked').value
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

            return _u
        }

        recieveValue(node) {
            return Number(node.querySelector('._val').checked == true)
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

            return _u
        }
    },
    'CsvArgument': class CsvArgument extends SubArgument {
        render(i) {
            let _u = u(`
                <div>
                    <div class="flex" style="gap: 7px;">
                        <div style="gap: 7px;" class="column wide _items"></div>
                        <input type="button" class="fit _add_icon" value="+">
                    </div>
                </div>
            `)

            this.container.append(_u)
            this.events(_u)

            return _u
        }
        events(node) {
            const addItem = (preset) => {
                const arg_type = this.data.argument_type
                const subparam = subparams[arg_type]

                if (!subparam) {
                    node.find('._items').append(
                        `<input class="_val" type="text" value="${escapeHtml(preset)}">`
                    )
                } else {
                    node.find('._items').append(subparam.render(this.data))
                }
            }

            const _default = this.data.default ?? ['']
            _default.forEach(item => {
                addItem(item)
            })

            u(node).on('click', '._add_icon', (e) => {
                addItem('')
            })

            u(node).find(".argument_value").on('keyup', "input[type='text']", (e) => {
                if (e.key == 'Backspace' && e.target.value.length == 0) {
                    if (e.target.previousSibling) {
                        e.target.previousSibling.focus()
                        u(e.target).remove()
                    }
                }
            })
        }

        recieveValue(node) {
            const vals = []
            node.querySelectorAll(".argument_value input[type='text']").forEach(el => {
                if (el.value != "") {
                    vals.push(el.value)
                }
            })

            if (vals.length == 0) {
                return undefined
            }

            return JSON.stringify(vals)
        }
    }
}

subparams['ObjectArgument'] = subparams['JsonArgument']

export default subparams

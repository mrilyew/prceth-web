import {proc_strtr, escapeHtml} from "./utils.js"
import tr from "../langs/locale.js"

class SubArgument {
    recieveValue(node) {
        return node.querySelector('._val').value
    }

    focus(node) {
        return node.querySelector('._val').focus()
    }

    post(data, node) {}
}

export const subparams = {
    'StringArgument': new class extends SubArgument {
        renderValue(data) {
            let _u = u(`
                <input class="_val" type="text">
            `)

            if (data.is_long == true) {
                _u = u(`
                    <textarea class="_val"></textarea>
                `)
            }

            if (data.default != null) {
                if (data.is_long != true) {
                    _u.attr("value", data.default)
                } else {
                    _u.html(escapeHtml(data.default))
                }
            }

            if (data.env_property != null) {
                _u.attr("placeholder", tr("content_will_be_set_from_env", escapeHtml(data.env_property)))
            }

            return _u
        }
    },
    'IntArgument': new class extends SubArgument {
        renderValue(data) {
            const _u = u(`
                <input class="_val" type="number">
            `)

            if (data.default != null) {
                _u.attr("value", data.default)
            }

            return _u
        }
    },
    'FloatArgument': new class extends SubArgument {
        renderValue(data) {
            const _u = u(`
                <input class="_val" step="0.01" type="number">
            `)

            if (data.default != null) {
                _u.attr("value", data.default)
            }

            return _u
        }
    },
    'LimitedArgument': new class extends SubArgument {
        renderValue(data) {
            let _u = u(`
                <div class="_val"></div>
            `)

            data.values.forEach(itm => {
                let name = escapeHtml(itm)
                if (data.docs && data.docs['values'] && data.docs.values[itm]) {
                    name = data.docs.values[itm]
                }

                _u.append(`<label class="block_label"><input type="radio" name="${data.name}" value="${escapeHtml(itm)}">${name}</label>`)
            })

            if (data.default != null) {
                _u.find(`.block_label input[value='${escapeHtml(data.default)}']`).attr("checked", "true")
            }

            return _u
        }

        recieveValue(node) {
            return node.querySelector('._val input:checked').value
        }
    },
    'BooleanArgument': new class extends SubArgument {
        renderValue(data) {
            let _u = u(`
                <input type="checkbox" class="_val">
            `)

            if (data.default == true) {
                _u.attr("checked", "")
            }

            return _u
        }

        recieveValue(node) {
            return Number(node.querySelector('._val').checked == true)
        }
    },
    'JsonArgument': new class extends SubArgument {
        renderValue(data) {
            let _u = u(`
                <textarea class="_val"></textarea>
            `)

            if (data.default != null) {
                _u.html(escapeHtml(JSON.stringify(data.default)))
            }

            return _u
        }
    },
    'CsvArgument': new class extends SubArgument {
        renderValue(data) {
            let _u = u(`
                <div>
                    <div class="flex" style="gap: 7px;">
                        <div style="gap: 7px;" class="column wide _items"></div>
                        <input type="button" class="fit _add_icon" value="+">
                    </div>
                </div>
            `)

            return _u
        }
        post(data, node) {
            const addItem = (preset) => {
                const arg_type = data.argument_type
                const subparam = subparams[arg_type]

                if (!subparam) {
                    node.find('._items').append(
                        `<input class="_val" type="text" value="${escapeHtml(preset)}">`
                    )
                } else {
                    node.find('._items').append(subparam.renderValue(data))
                }
            }

            const _default = data.default ?? ['']
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

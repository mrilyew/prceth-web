import app from "../app.js"
import {random_int, array_splice} from "../utils/utils.js"

class MessageBox {
    constructor(data = {}) {
        const title = data.title ?? 'Untitled'
        const body  = data.body ?? '<hr>'
        const buttons = data.buttons ?? []
        const callbacks = data.callbacks ?? []
        const close_on_buttons = data.close_on_buttons ?? true
        const unique_name = data.unique_name ?? null
        const warn_on_exit = data.warn_on_exit ?? false
        const custom_template = data.custom_template ?? null
        if(unique_name && app.messageboxes.find(item => item.unique_name == unique_name) != null) {
            return
        }

        this.title = title
        this.body  = body
        this.id    = random_int(0, 10000)
        this.close_on_buttons = close_on_buttons
        this.unique_name      = unique_name
        this.warn_on_exit     = warn_on_exit

        if(!custom_template) {
            u('body').addClass('dimmed').append(this.__getTemplate())
        } else {
            custom_template.addClass('msg-all')
            custom_template.attr('data-id', this.id)
            u('body').addClass('dimmed').append(custom_template)
        }

        u('html').attr('style', 'overflow-y:hidden')

        buttons.forEach((text, callback) => {
            this.node.find('.msg-diag-actions').append(u(`<input type="button" class="button" value="${text}">`))

            const button = u(this.node.find('.msg-diag-actions > input.button').last())
            button.on("click", (e) => {
                callbacks[callback]()

                if(close_on_buttons) {
                    this.close()
                }
            })
        })

        app.messageboxes.push(this)
    }

    __getTemplate() {
        return u(
        `<div class="msg-window msg-all" data-id="${this.id}">
            <div class="msg-diag">
                <div class="msg-diag-head">${this.title}</div>
                <div class="msg-diag-body">${this.body}</div>
                <div class="msg-diag-actions"></div>
            </div>
        </div>`)
    }

    get node() {
        return u(`.msg-window[data-id='${this.id}']`)
    }

    async __showCloseConfirmationDialog() {
        return new Promise((resolve, reject) => {
            const msg = new CMessageBox({
                title: tr('exit_noun'),
                body: tr('exit_confirmation'),
                warn_on_exit: false,
                unique_name: 'close_confirmation',
                buttons: [tr('no'), tr('yes')],
                callbacks: [() => {
                    msg.close()
                    resolve(false)
                }, () => {
                    this.__exitDialog()
                    resolve(true)
                }]
            })
        })
    }

    __exitDialog() {
        this.node.remove()
        if(u('.msg-window:not(.msgbox-hidden)').length < 1) {
            u('body').removeClass('dimmed')
            u('html').attr('style', 'overflow-y:scroll')
        }

        const current_item  = app.messageboxes.find(item => item.id == this.id)
        const index_of_item = app.messageboxes.indexOf(current_item)

        app.messageboxes = array_splice(app.messageboxes, index_of_item)
    }

    close() {
        this.__exitDialog()
    }

    hide() {
        u('body').removeClass('dimmed')
        u('html').attr('style', 'overflow-y:scroll')
        this.node.attr('style', 'display: none;').addClass('msgbox-hidden')
        this.hidden = true
    }

    reveal() {
        u('body').addClass('dimmed')
        u('html').attr('style', 'overflow-y:hidden')
        this.node.attr('style', 'display: block;')
        this.hidden = false
    }
}

export default MessageBox

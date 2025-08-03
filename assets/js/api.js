import MessageBox from "./ui/MessageBox.js"
import tr from "./langs/locale.js"
import app from "./app.js"
import { escapeHtml } from "./utils/utils.js"

export const api = new class {
    async act(params = {}, error_alert = true) {
        try {
            const res = await app.ws_connection.act(params)

            console.log("API: ", params["i"], params, res)

            return res
        } catch(e) {
            if (error_alert) {
                const msg = new MessageBox({
                    title: tr("exceptions.error_title"),
                    body: tr("exceptions.error_api_description", escapeHtml(e.exception_name), escapeHtml(e.message)),
                    buttons: ['ok'],
                    callbacks: [() => {}],
                })
            }

            throw e
        }
    }

    async executable(type, name, args) {
        switch(type) {
            case "representation":
                args['i'] = "Executables.RunRepresentation"
                args['representation'] = name
                break
            case "act":
                args['i'] = name
                break
            case "extractor":
                args['i'] = "Executables.RunExtractor"
                args['extractor'] = name
                break
        }

        return await this.act(args)
    }
}

export default api

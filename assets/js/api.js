import MessageBox from "./utils/MessageBox.js"
import tr from "./langs/locale.js"

export const api = new class {
    async act(params = {}) {
        const request_url = new URL(location.href)
        const postData = new FormData()
        let data = null

        request_url.pathname = '/api/act'

        Object.entries(params).forEach(n => {
            postData.set(n[0], n[1])
        })

        try {
            data = await fetch(request_url, {
                method: 'POST',
                body: postData
            })

            return await data.json()
        } catch(e) {
            const msg = new MessageBox({
                title: tr("exceptions.error_title"),
                body: tr("exceptions.error_net_description", DOMPurify.sanitize(e)),
                buttons: ['ok'],
                callbacks: [() => {}],
            })
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

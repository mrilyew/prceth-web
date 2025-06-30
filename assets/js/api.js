export const api = new class {
    async act(params = {}) {
        const request_url = new URL(location.href)
        const postData = new FormData()

        request_url.pathname = '/api/act'

        Object.entries(params).forEach(n => {
            postData.set(n[0], n[1])
        })

        const data = await fetch(request_url, {
            method: 'POST',
            body: postData
        })

        return await data.json()
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

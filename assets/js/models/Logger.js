import Model from "../models/Model.js"
import LogMessage from "./LogMessage.js"

class Logger extends Model {
    static async getList() {
        const resp = await api.act({
            "i": "Logs.List",
        })

        return resp
    }

    static async readFile(file) {
        const resp = await api.act({
            "i": "Logs.GetByName",
            "file": file
        })

        return LogMessage.fromArray(resp.logs)
    }
}

export default Logger

import Model from "../models/Model.js"
import {simple_date} from "../utils/utils.js"

class LogMessage extends Model {
    get section() {
        return this.section
    }
    
    get kind() {
        return this.kind
    }

    get message() {
        return this.message
    }

    get readable_date() {
        const date = simple_date(i.time)
        
        return `
        <span>${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}</span>
        <span>${String(date.hour).padStart(2, "0")}:${String(date.minutes).padStart(2, "0")}:${String(date.seconds).padStart(2, "0")}</span>
        `
    }

    static fromArray(items) {
        const resp = []
        items.forEach(element => {
            resp.push(new LogMessage(element))
        })

        return resp
    }
}

export default LogMessage

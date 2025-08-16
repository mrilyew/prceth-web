import Model from "../models/Model.js"
import {resolve_locale} from "../utils/utils.js"

class ExecutableVariant extends Model {
    get name() {
        return resolve_locale(this.data.name)
    }

    get list() {
        return this.data.list
    }
}

export default ExecutableVariant

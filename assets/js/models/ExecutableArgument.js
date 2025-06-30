import Model from "../models/Model.js"
import subparams from "../utils/subparams.js"

class ExecutableArgument extends Model {
    constructor(data) {
        super(data)

        this.argument_class = subparams[this.type]
    }

    get type() {
        return this.data.type
    }

    get name() {
        return this.data.name
    }

    get default() {
        return this.data.default
    }

    get docs() {
        return this.data.docs
    }

    get is_hidden() {
        return this.data.hidden == true
    }
}

export default ExecutableArgument

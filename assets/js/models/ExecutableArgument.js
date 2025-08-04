import Model from "../models/Model.js"
import subparams from "../resources/subparams.js"

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

    get localized_name() {
        return this.data["docs"]["name"] ?? this.name
    }

    get default() {
        if (this.data.current) {
            return this.data.current
        }

        return this.data.default
    }

    get docs() {
        return this.data.docs
    }

    get original_arg() {
        return this.data.orig
    }

    get is_hidden() {
        return this.data.hidden == true
    }

    get is_required() {
        return this.data.assertion != null && this.data.assertion.not_null == true
    }
}

export default ExecutableArgument

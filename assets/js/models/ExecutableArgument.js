import Model from "../models/Model.js"
import subparams from "../resources/subparams.js"
import {resolve_locale} from "../utils/utils.js"

class ExecutableArgument extends Model {
    constructor(data) {
        super(data)

        this.argument_class = subparams[this.type]
    }

    get type() {
        return this.data.type ?? "StringArgument"
    }

    get name() {
        return this.data.name
    }

    get localized_name() {
        if (!this.data.docs) {
            return null
        }

        return resolve_locale(this.data["docs"]["name"]) ?? this.name
    }

    get localized_description() {
        return resolve_locale(this.data.docs.definition)
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

    get values() {
        return this.data.values
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

import api from "../api.js"
import Model from "../models/Model.js"
import ExecutableArgument from "./ExecutableArgument.js"

export class Executable extends Model {
    static async getList(class_type) {
        const resp = await api.act({
            "i": "Executables.List",
            "class_type": class_type,
        })

        return Executable.fromArray(resp.payload)
    }

    static async getFromName(class_name) {
        const its = class_name.split('.')
        const class_type = its[1].slice(0, -1)
        const class_id = its[2] + '.' + its[3]

        const resp = await api.act({
            'i': "Executables.Describe",
            "class_type": class_type,
            'class': class_id
        })

        return new Executable(resp.payload)
    }

    static async getFromType(type_name) {
        switch(type_name) {
            case "extractor":
                return await Executable.getFromName("executables.acts.Executables.RunExtractor")
            case "representation":
                return await Executable.getFromName("executables.acts.Executables.RunRepresentation")
        }
    }

    get category() {
        return this.data.category
    }

    get name() {
        return this.data.name
    }

    get sub() {
        return this.data.sub
    }

    get docs() {
        return this.data.docs
    }

    get args() {
        const args = this.data.args
        const f_ = []
        args.forEach(el => {
            f_.push(new ExecutableArgument(el))
        })

        return f_
    }
}

export default Executable

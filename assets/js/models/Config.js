import Model from "../models/Model.js"
import api from "../api.js"

class Config extends Model {
    static async list() {
        return await api.act({
            "i": "App.RecieveConfig"
        }, false)
    }

    static categories_from_args(args) {
        const all_categories = []

        args.forEach(item => {
            const name = item.name
            const cats = name.split(".")

            all_categories.push(cats[0])
        })

        return new Set(all_categories)
    }
    
    static async update(new_data) {
        return await api.act({
            "i": "App.UpdateConfig",
            "values": JSON.stringify(new_data)
        }, false)
    }
}

export default Config

import api from "../api.js"
import Model from "./Model.js"

class Config extends Model {
    async get_items() {
        this.items = await api.act({
            "i": "App.ConfigRecieve",
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

    static async update_env(new_data) {
        return await api.act({
            "i": "App.UpdateConfig",
            "type": "env",
            "values": JSON.stringify(new_data)
        }, false)
    }
}

export default Config

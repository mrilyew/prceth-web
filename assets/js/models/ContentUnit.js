import api from "../api.js"
import Model from "../models/Model.js"

export class ContentUnit extends Model {
    static async fromIds(ids) {
        const dl = await api.act({
            "i": "ContentUnits.GetById",
            "ids": ids,
        })

        return ContentUnit.fromArray(dl)
    }

    static async search(offset = null, count = 100) {
        const resp = await api.act({
            "i": "ContentUnits.Search",
            "count": count,
            "offset": offset ?? "",
        })
        const items = resp.items

        return {
            "total_count": resp.total_count,
            "items": ContentUnit.fromArray(items)
        }
    }
}

export default ContentUnit

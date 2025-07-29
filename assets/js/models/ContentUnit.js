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

    static async search(count = 100, offset = null) {
        const resp = await api.act({
            "i": "ContentUnits.Search",
            "count": count,
            "timestamp_after": offset ?? "",
        })
        const items = resp.items
        let last_offset = null

        if (items[items.length - 1] != null) {
            last_offset = items[items.length - 1].created
        }

        return {
            "total_count": resp.total_count,
            "last_offset": last_offset,
            "items": ContentUnit.fromArray(items)
        }
    }
}

export default ContentUnit

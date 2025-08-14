import api from "../api.js"
import Model from "../models/Model.js"

export class ContentUnit extends Model {
    constructor(data) {
        super(data)

        this.uuid = Number(data.uuid)
    }

    static async fromIds(ids) {
        const dl = await api.act({
            "i": "ContentUnits.GetById",
            "ids": ids,
        }, false)

        return ContentUnit.fromArray(dl)
    }

    static async search(params) {
        const resp = await api.act(Object.assign({
            "i": "ContentUnits.Search",
        }, params), false)
        const items = resp.items

        return {
            "total_count": resp.total_count,
            "items": ContentUnit.fromArray(items)
        }
    }
}

export default ContentUnit

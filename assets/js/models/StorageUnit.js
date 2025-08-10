import api from "../api.js"
import Model from "../models/Model.js"

export class StorageUnit extends Model {
    static async search(params) {
        const resp = await api.act(Object.assign({
            "i": "StorageUnits.Search",
        }, params))
        const items = resp.items

        return {
            "total_count": resp.total_count,
            "items": StorageUnit.fromArray(items)
        }
    }

    get name() {
        return this.data.upload_name
    }

    get filesize() {
        return this.data.filesize
    }
    
    get dir_filesize() {
        return this.data.filesize
    }
}

export default StorageUnit

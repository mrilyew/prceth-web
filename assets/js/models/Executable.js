import Model from "./Model.js"
import api from "../api.js"

class Executable extends Model {
    static async byName(class_name) {
        const resp = await api.act({
            'i': "Executables.ExecutableDescribe",
            'class': class_name
        })

        return new Executable(resp)
    }
}

export default Executable

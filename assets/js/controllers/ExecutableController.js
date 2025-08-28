import Controller from "./Controller.js"
import router from "../router.js"
import Executable from "../models/Executable.js"

class ExecutableController extends Controller {
    async executable_page(container) {
        const executable_name = router.url.getParam("name")
        const executable = await Executable.byName(executable_name)
        
        container.set(`
            <span>${executable.data.category}.${executable.data.name}</span>    
        `)
        console.log(executable)
    }
}

export default ExecutableController

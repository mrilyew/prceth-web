import app from "../main.js"
import BaseController from "./BaseController.js"
import api from "../api.js"
import tr from "../langs/locale.js"

export class AboutController extends BaseController {
    async main() {
        const stat = await api.act({
            "i": "App.Stat"
        })

        app.setContent(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>${tr("statistics")}</b>
                <p>${stat.payload.content_units.total_count} units</p>
            </div>
        `)
    }
}

export default AboutController

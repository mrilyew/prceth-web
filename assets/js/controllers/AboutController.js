import BaseController from "./BaseController.js"
import app from "../app.js"
import api from "../api.js"
import tr from "../langs/locale.js"

export class AboutController extends BaseController {
    async main() {
        const stat = await api.act({
            "i": "App.Stat"
        })

        app.content_side.set(`
            <div id="about_page" style="padding: 10px 10px;">
                <b>${tr("statistics")}</b>
                <p>${stat.payload.content_units.total_count} units</p>
            </div>
        `)
        app.title(tr("common_page"))
    }
}

export default AboutController

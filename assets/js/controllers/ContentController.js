import app from "../app.js"
import router from "../router.js"
import BaseController from "./BaseController.js"
import ContentUnit from "../models/ContentUnit.js"
import {create_json_viewer} from "../utils/utils.js"
import ContentUnitSmallViewModel from "../view_models/ContentUnitSmallViewModel.js"
import tr from "../langs/locale.js"

export class ContentController extends BaseController {
    async main(container) {
        let total_count, scrolled_count, last_offset = 0

        const recieveItems = async (offset) => {
            const response = await ContentUnit.search(100, offset)

            total_count = response.total_count
            scrolled_count = (scrolled_count ?? 0) + response.items.length

            const last_item = response.items[response.items.length - 1]

            if (last_item) {
                last_offset = last_item.data.created
            }

            return response.items
        }

        const pushItems = (items, container_node) => {
            items.forEach(itm => {
                container_node.find(".container_items").append((new ContentUnitSmallViewModel).render(itm))
            })

            if (scrolled_count < total_count) {
                container_node.find(".container_items").append(`
                    <div class="show_more">Show next</div>    
                `)
            }
        }

        const items = await recieveItems(last_offset)
        const insert_node = u(`
            <div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        pushItems(items, insert_node)

        container.set(insert_node.html())
        container.title(tr("content.title"))

        u("#container_body").on("click", ".show_more", async (e) => {
            const container_node = u(e.target).closest("#container_body")
            u(e.target).addClass('unclickable')

            const new_items = await recieveItems(last_offset)

            u(e.target).remove()

            pushItems(new_items, container_node)
        })
    }

    async page() {
        const uuids = router.url.getParam('uuids')
        const ids = uuids.split(',')
        const units = await ContentUnit.fromIds(ids)

        const _u = u(`
            <div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)

        units.forEach(unit => {
            _u.find(".container_items").append((new ContentUnitSmallViewModel).render(unit))
        })

        if (units.length == 1) {
            u("#side").html("")

            const jsonViewer = create_json_viewer()
            jsonViewer.data = units[0].data.content

            u("#side").append(jsonViewer)
        }

        app.content_side.set(_u.html())
        app.content_side.title(tr("content_units"))
    }
}

export default ContentController

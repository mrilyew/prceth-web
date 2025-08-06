import app from "../app.js"
import router from "../router.js"
import BaseController from "./BaseController.js"
import ContentUnit from "../models/ContentUnit.js"
import {create_json_viewer} from "../utils/utils.js"
import ContentUnitSmallViewModel from "../view_models/ContentUnitSmallViewModel.js"
import tr from "../langs/locale.js"

export class ContentController extends BaseController {
    async main(container) {
        const content_list = new class {
            total_count = 0
            offset = null
            order = "desc"
            items = []

            async fetch(offset_id, per_page = 100) {
                const new_items = await ContentUnit.search(offset_id, per_page)
                let last_item = null

                this.items = this.items.concat(new_items.items)
                this.total_count = new_items.total_count
                // getting current id

                if (this.order == "desc") {
                    last_item = new_items.items[0]
                } else {
                    last_item = new_items.items[new_items.items.length - 1]
                }

                console.log(last_item, new_items)
                this.offset = last_item.data.id

                return new_items.items
            }

            insert(items, container) {
                items.forEach(itm => {
                    new ContentUnitSmallViewModel(container, itm).render()
                })

                if (this.items.length < this.total_count) {
                    container.append(`
                        <div class="show_more">${tr("nav.show_next")}</div>    
                    `)
                }
            }
        }

        const items = await content_list.fetch(content_list.offset)
        container.set(`
            <div>
                <div id="container_body">
                    <div class="container_items"></div>
                </div>
            </div>
        `)
        container.title(tr("content.title"))

        content_list.insert(items, container.node.find(".container_items"))

        console.log(container.node)
        container.node.on("click", ".show_more", async (e) => {
            const container_node = u(e.target).closest("#container_body")

            u(e.target).addClass('unclickable')

            const new_items = await content_list.fetch(content_list.offset)

            u(e.target).remove()

            content_list.insert(new_items, container_node.find(".container_items"))
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

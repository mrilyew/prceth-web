import {proc_strtr, escapeHtml, readable_filesize} from "../utils/utils.js"
import ViewModel from "./ViewModel.js"

class StorageUnitViewModel extends ViewModel {
    render(args) {
        const data = this.item.data
        const is_dir_more_than_main = this.item.filesize > this.item.dir_filesize

        const _u = u(`
            <div class="storage_unit_item scroll_element">
                <a href="#su?uuids=${data.id}" class="scroll_element_title">
                    <div class="name">
                        <b class="no_overflow">${proc_strtr(escapeHtml(this.item.name), 50)}</b>
                        <div class="size">
                            <span>${readable_filesize(this.item.filesize)}</span>
                            ${is_dir_more_than_main ? `<span>${readable_filesize(this.item.dir_filesize)}</span>` : ""}
                        </div>
                    </div>

                    <div class="toggle_block"><div class="toggle_icon"></div></div>
                </a>
                <div class="data">
                    <div class="data_table flex"></div>
                </div>
            </div>
        `)

        this.container.append(_u)
        this.node = _u

        return _u
    }
}

export default StorageUnitViewModel

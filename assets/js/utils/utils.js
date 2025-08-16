export function escapeHtml(str) {
    if (!str) {
        return ""
    }

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#x60;');
}

export function collectParams(node) 
{
    pars = {}
    node.forEach(el => {
        let _name = el.querySelector("input[data-type='param_name']")
        let _val = el.querySelector("input[data-type='param_value']")

        pars[_name.value] = _val.value
    })

    return pars
}

// stolen
export function readable_filesize(bytes, si) {
    const thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    let units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB']
    let u = -1
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1)
    return bytes.toFixed(1)+' '+units[u]
}

export function collectParamsByEach(node)
{
    pars = {}
    els = node.querySelectorAll("*[data-pname]")

    els.forEach(el => {
        pname = el.dataset.pname
        if (el.type == 'text' || el.type == 'number') {
            pars[pname] = el.value
        }

        if (el.type == 'checkbox') {
            pars[pname] = Number(el.checked)
        }
    })

    return pars
}

export function proc_strtr(str, length) {
    const newString = str.substring(0, length)
    return newString + (str !== newString ? "…" : "")
}

export function create_json_viewer() {
    const jsonViewer = document.createElement("andypf-json-viewer")

    jsonViewer.expanded = true
    jsonViewer.indent = 4
    jsonViewer.expanded = 4
    jsonViewer.showDataTypes = false
    jsonViewer.showSize = false

    return jsonViewer
}

export function random_int(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

export function array_splice(array, key)
{
    let resultArray = [];

    for(let i = 0; i < array.length; i++){
        if(i != key){
            resultArray.push(array[i]);
        }
    }

    return resultArray;
}

export function simple_date(ms) {
    const date = new Date(ms * 1000)

    const year = date.getFullYear()
    const month = (date.getMonth() + 1)
    const day = date.getDate()
    const hour = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()

    return {
        "year": year,
        "month": month,
        "day": day,
        "hour": hour,
        "minutes": minutes,
        "seconds": seconds
    }
}

export function resolve_locale(dict) {
    const lang = window.cfg["ui.lang"]
    if (!dict || !dict.hasOwnProperty(lang)) {
        if (dict && dict.hasOwnProperty("eng")) {
            return dict["eng"]
        }

        return null
    }

    return dict[lang]
}

export default new class {}

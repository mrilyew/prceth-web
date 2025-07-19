class ContentUnitsEvents {
    constructor() {
        u('#container').on('click', ".content_unit_item", (e) => {
            e.preventDefault()

            const tg = u(e.target).closest(".content_unit_item")
            tg.toggleClass("shown")
        })
    }
}

export default ContentUnitsEvents

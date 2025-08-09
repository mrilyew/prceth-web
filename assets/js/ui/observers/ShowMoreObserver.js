const ShowMoreObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.click()
        }
    })
}, {})

export default ShowMoreObserver

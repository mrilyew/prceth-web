class Model {
    constructor(data) {
        this.data = data
    }

    static fromArray(arr) {
        const f = []
        arr.forEach(el => {
            f.push(new this(el))
        })

        return f
    }
}

export default Model

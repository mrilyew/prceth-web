class ApiError extends Error {
    constructor(message, exception_name, exception_code) {
        super(message)
        this.exception_name = exception_name
        this.exception_code = exception_code
    }
}

export default ApiError

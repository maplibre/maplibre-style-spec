class ExpressionParsingError extends Error {
    constructor(key, message) {
        super(message);
        this.message = message;
        this.key = key;
    }
}
export default ExpressionParsingError;
//# sourceMappingURL=parsing_error.js.map
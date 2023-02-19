// Note: Do not inherit from Error. It breaks when transpiling to ES5.
export default class ParsingError {
    constructor(error) {
        this.error = error;
        this.message = error.message;
        const match = error.message.match(/line (\d+)/);
        this.line = match ? parseInt(match[1], 10) : 0;
    }
}
//# sourceMappingURL=parsing_error.js.map
// Note: Do not inherit from Error. It breaks when transpiling to ES5.
export default class ValidationError {
    constructor(key, value, message, identifier) {
        this.message = (key ? `${key}: ` : '') + message;
        if (identifier)
            this.identifier = identifier;
        if (value !== null && value !== undefined && value.__line__) {
            this.line = value.__line__;
        }
    }
}
//# sourceMappingURL=validation_error.js.map
import validateExpression from './validate_expression';
import validateString from './validate_string';
export default function validateImage(options) {
    if (validateString(options).length === 0) {
        return [];
    }
    return validateExpression(options);
}
//# sourceMappingURL=validate_image.js.map
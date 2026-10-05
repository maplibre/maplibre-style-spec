import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {validateBoolean} from './validate_boolean';

export function validateVerticalGradient(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'array') {
        if (value.length < 1 || value.length > 2) {
            return [
                new ValidationError(
                    key,
                    value,
                    `fill-extrusion-vertical-gradient array requires 1 or 2 values; ${value.length} values found`
                )
            ];
        }

        let errors = [];
        errors = errors.concat(
            options.validateSpec({
                key: `${key}[0]`,
                value: value[0],
                validateSpec: options.validateSpec,
                valueSpec: {type: 'number', minimum: 0, maximum: 1}
            })
        );
        if (value.length > 1) {
            errors = errors.concat(
                options.validateSpec({
                    key: `${key}[1]`,
                    value: value[1],
                    validateSpec: options.validateSpec,
                    valueSpec: {type: 'number', minimum: 0}
                })
            );
        }
        return errors;
    }

    return validateBoolean({
        key,
        value,
        valueSpec: {}
    });
}

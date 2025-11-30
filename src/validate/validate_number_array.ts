import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {validateNumber} from './validate_number';

export function validateNumberArray(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'array') {
        const arrayElementSpec = {
            type: 'number'
        };

        if (value.length < 1) {
            return [
                new ValidationError(key, value, 'array length at least 1 expected, length 0 found')
            ];
        }

        let errors = [];
        for (let i = 0; i < value.length; i++) {
            errors = errors.concat(
                options.validateSpec({
                    key: `${key}[${i}]`,
                    value: value[i],
                    validateSpec: options.validateSpec,
                    valueSpec: arrayElementSpec
                })
            );
        }
        return errors;
    } else {
        return validateNumber({
            key,
            value,
            valueSpec: {}
        });
    }
}

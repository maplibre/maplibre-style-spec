import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {validateColor} from './validate_color';

export function validateColorArray(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'array') {

        if (value.length < 1) {
            return [new ValidationError(key, value, 'array length at least 1 expected, length 0 found')];
        }

        let errors = [];
        for (let i = 0; i < value.length; i++) {
            errors = errors.concat(validateColor({
                key: `${key}[${i}]`,
                value: value[i],
                valueSpec: {}
            }));
        }
        return errors;
    } else {
        return validateColor({
            key,
            value,
            valueSpec: {}
        });
    }
}

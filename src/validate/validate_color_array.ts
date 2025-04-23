import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {validateColor} from './validate_color';

export function validateColorArray(options) {
    const key = options.key;
    const value = options.value;
    const valueSpec = options.valueSpec;
    const type = getType(value);

    if (type === 'array') {

        if (valueSpec && valueSpec['min-length'] && value.length < valueSpec['min-length']) {
            return [new ValidationError(key, value, `array length at least ${valueSpec['min-length']} expected, length ${value.length} found`)];
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
        if (valueSpec && valueSpec['min-length'] && 1 < valueSpec['min-length']) {
            return [new ValidationError(key, value, `array length at least ${valueSpec['min-length']} expected, length 1 found`)];
        }
        return validateColor({
            key,
            value,
            valueSpec: {}
        });
    }
}

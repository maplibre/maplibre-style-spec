import {getType} from '../util/get_type';
import {validateColor} from './validate_color';

export function validateColorArray(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'array') {
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

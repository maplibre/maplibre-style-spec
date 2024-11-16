import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {Color} from '../expression/types/color';

export function validateColor(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type !== 'string') {
        return [new ValidationError(key, value, `color expected, ${type} found`)];
    }

    if (!Color.parse(String(value))) { // cast String object to string primitive
        return [new ValidationError(key, value, `color expected, "${value}" found`)];
    }

    return [];
}

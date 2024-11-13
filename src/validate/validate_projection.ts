import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import {isProjectionValue, isPropertyValueSpecification} from '../util/projection';

export default function validateProjection(options) {

    const key = options.key;
    let value = options.value;
    value = value instanceof String ? value.valueOf() : value;

    const type = getType(value);

    if (type === 'array' && !isProjectionValue(value) && !isPropertyValueSpecification(value)) {
        return [new ValidationError(key, value, `projection expected, invalid array ${JSON.stringify(value)} found`)];
    }  else if (!['array', 'string'].includes(type)) {
        return [new ValidationError(key, value, `projection expected, invalid type "${type}" found`)];
    }

    return [];
}
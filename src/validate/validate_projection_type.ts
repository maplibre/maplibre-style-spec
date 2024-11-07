import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import {isPrimitiveProjection, isProjectionType} from '../util/projection';

export default function validatevalue(options) {

    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'string' && !isPrimitiveProjection(value)) {
        return [new ValidationError(key, value, `projectionType expected, invalid string "${value}" found`)];
    } else if (type === 'array' && !isProjectionType(value)) {
        return [new ValidationError(key, value, `projectionType expected, invalid array ${JSON.stringify(value)} found`)];
    }  else if (!['array', 'string'].includes(type)) {
        return [new ValidationError(key, value, `projectionType expected, invalid type "${type}" found`)];
    } 
    
    return [];
}
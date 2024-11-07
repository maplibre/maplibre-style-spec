import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import {isProjectionPreset, isProjectionPrimitive, isProjectionTransitionConfig} from '../util/projection';

export default function validatevalue(options) {

    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type === 'string' && !(isProjectionPrimitive(value) || isProjectionPreset(value))) {
        return [new ValidationError(key, value, `projectionTransition expected, invalid string "${value}" found`)];
    } else if (type === 'array' && !isProjectionTransitionConfig(value)) {
        return [new ValidationError(key, value, `projectionTransition expected, invalid array ${JSON.stringify(value)} found`)];
    }  else if (!['array', 'string'].includes(type)) {
        return [new ValidationError(key, value, `projectionTransition expected, invalid type "${type}" found`)];
    } 
    
    return [];
}
import {ValidationError} from '../error/validation_error';
import {ProjectionDefinitionT, PropertyValueSpecification} from '../types.g';
import {getType} from '../util/get_type';

export function validateProjectionDefinition(options) {

    const key = options.key;
    let value = options.value;
    value = value instanceof String ? value.valueOf() : value;

    const type = getType(value);

    if (type === 'array' && !isProjectionDefinitionValue(value) && !isPropertyValueSpecification(value)) {
        return [new ValidationError(key, value, `projection expected, invalid array ${JSON.stringify(value)} found`)];
    }  else if (!['array', 'string'].includes(type)) {
        return [new ValidationError(key, value, `projection expected, invalid type "${type}" found`)];
    }

    return [];
}

function isPropertyValueSpecification(value: unknown): value is PropertyValueSpecification<ProjectionDefinitionT> {

    if (['interpolate', 'step', 'literal'].includes(value[0])) {
        return true
    }
    return false
}

function isProjectionDefinitionValue(value: unknown): value is ProjectionDefinitionT {
    return Array.isArray(value) &&
        value.length === 3 &&
        typeof value[0] === 'string' &&
        typeof value[1] === 'string' &&
        typeof value[2] === 'number';
}
import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {ProjectionTypeSpecification, StyleSpecification} from '../types.g';
import {isPrimitiveProjection, isProjectionType} from '../util/projection';

interface ValidateProjectionOptions {
    sourceName?: string;
    value: ProjectionTypeSpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export default function validateProjectionMode(options: ValidateProjectionOptions) {
    const projectionType: ProjectionTypeSpecification = options.value;

    if (!projectionType){

        return [new ValidationError('projection.type', projectionType, 'value is missing')];
    }

    const rootType = getType(projectionType);
    if (projectionType === undefined) {
        return [];
    } 
    
    if (rootType === 'string' && !isPrimitiveProjection(projectionType)) {
        return [new ValidationError('projection.type', projectionType, `found "${projectionType}", expected "mercator" or "globe".`)];
    } else if (rootType === 'array' && !isProjectionType(projectionType)) {
        return [new ValidationError('projection.type', projectionType, `incorrect syntax, found ${JSON.parse(projectionType)}.`)];
    }  else if (!['array', 'string'].includes(rootType)) {
        return [new ValidationError('projection.type', projectionType, `found value of type "${rootType}", expected string or array`)];
    } 
    return [];
}

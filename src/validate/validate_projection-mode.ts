import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {ProjectionType, StyleSpecification} from '../types.g';
import { isPrimitiveProjection, isProjectionTransition, isProjectionType } from '../util/projection';

interface ValidateProjectionOptions {
    sourceName?: string;
    value: ProjectionType;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export default function validateProjectionMode(options: ValidateProjectionOptions) {
    const projectionType: ProjectionType = options.value;

    if (!projectionType){

        return [new ValidationError('projection-mode', projectionType, 'projection mode is missing')];
    }

    const rootType = getType(projectionType);
    if (projectionType === undefined) {
        return [];
    } 
    
    if (rootType === 'string' && !isPrimitiveProjection(projectionType)) {
        return [new ValidationError('projection-mode', projectionType, 'does not fit the type PrimitiveProjection')];
    } else if (rootType === 'object' && !isProjectionTransition(projectionType)) {
        return [new ValidationError('projection-mode', projectionType, 'does not fit the type ProjectionTransition')];
    } else if (rootType === 'array' && !isProjectionType(projectionType)) {
        return [new ValidationError('projection-mode', projectionType, 'does not fit the type ProjectionType')];
    }  else if (!['array', 'object', 'string'].includes(rootType)) {
        return [new ValidationError('projection-mode', projectionType, `expected array, object, string - found ${rootType}`)];
    } 
    return [];
}

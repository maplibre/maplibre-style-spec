import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {PrimitiveProjection, ProjectionSpecification, ProjectionTransition, StyleSpecification} from '../types.g';

interface ValidateProjectionOptions {
    sourceName?: string;
    value: ProjectionSpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

function isProjectionTransition(projection: any): projection is ProjectionTransition {
    return projection && typeof projection === 'object' && 'from' in projection && 'to' in projection && 'transition' in projection;
}

function isPrimitiveProjection(projection: any): projection is PrimitiveProjection {
    return typeof projection === 'string' && (projection === 'mercator' || projection === 'globe');
}
function isProjectionSpecification(projection: any): projection is ProjectionSpecification {
    if (isPrimitiveProjection(projection) || isProjectionTransition(projection)) {
        return true;
    }

    if (Array.isArray(projection) && projection.length > 0) {
        if (['literal', 'step', 'interpolate-projection'].includes(projection[0])) {
            return true
        }
    }

    return false;
}

export default function validateProjection(options: ValidateProjectionOptions) {
    let projection = options.value;
    const styleSpec = options.styleSpec;
    const projectionSpec = styleSpec.projection;
    const style = options.style;

    const rootType = getType(projection);
    if (projection === undefined) {
        return [];
    } 
    
    if (rootType === 'string' && !isPrimitiveProjection(projection)) {
        return [new ValidationError('projection', projection, 'does not fit the type PrimitiveProjection')];
    } else if (rootType === 'object' && !isProjectionTransition(projection)) {
        return [new ValidationError('projection', projection, 'does not fit the type ProjectionTransition')];
    } else if (rootType === 'array' && !isProjectionSpecification(projection)) {
        return [new ValidationError('projection', projection, 'does not fit the type ProjectionSpecification')];
    }  else if (!['array', 'object', 'string'].includes(rootType)) {
        return [new ValidationError('projection', projection, 'expected array, object, string - found ' + rootType)];
    } 
    return [];
}

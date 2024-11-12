import v8 from '../reference/v8.json' with { type: 'json' };
import {ProjectionPrimitiveT, ProjectionT, ProjectionSpecification, PropertyValueSpecification} from '../types.g';

export class Projection extends Array {
    constructor(from: ProjectionPrimitiveT, to: ProjectionPrimitiveT, transition: number){
        super(3);
        this[0] = from;
        this[1] = to;
        this[2] = transition;
    }
    
    get from() { return this[0]; }
    get to() { return this[1]; }
    get transition() { return this[2]; }

    toString() {
        return `["${this[0]}", "${this[1]}", ${this[2]}]`;
    }
}

export function isProjectionConfig(value: unknown): value is ProjectionSpecification {
    return isProjectionPrimitive(value) || isProjectionValue(value) || isPropertyValueSpecification(value);
}

export function isPropertyValueSpecification(value: unknown): value is PropertyValueSpecification<ProjectionT> {

    if (['interpolate-projection', 'step', 'literal'].includes(value[0])) {
        return true
    }
    return false
}

export function isProjectionValue(value: unknown): value is ProjectionT {
    return Array.isArray(value) &&
        value.length === 3 &&
        isProjectionPrimitive(value[0]) &&
        isProjectionPrimitive(value[1]) &&
        typeof value[2] === 'number';
}

export function isProjectionPrimitive(value: unknown): value is ProjectionPrimitiveT {
    return Object.keys(v8.projectionConfig.type.values.projections).includes(value as string);
}

export function isProjectionPreset(value: unknown): value is ProjectionPrimitiveT {
    return Object.keys(v8.projectionConfig.type.values.presets).includes(value as string);
}
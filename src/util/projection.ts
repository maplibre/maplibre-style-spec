import {ProjectionT, ProjectionSpecification, PropertyValueSpecification} from '../types.g';

export default class Projection extends Array {
    constructor(from: string, to: string, transition: number){
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
    return typeof value === 'string' || isProjectionValue(value) || isPropertyValueSpecification(value);
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
        typeof value[0] === 'string' &&
        typeof value[1] === 'string' &&
        typeof value[2] === 'number';
}
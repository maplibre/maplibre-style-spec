import {PrimitiveProjection, ProjectionTransition, ProjectionTypeSpecification, PropertyValueSpecification} from '../types.g';

export class Projection {
    readonly from: PrimitiveProjection;
    readonly to: PrimitiveProjection;
    readonly transition: number;
    constructor(from: PrimitiveProjection, to: PrimitiveProjection, transition: number){
        this.from = from;
        this.to = to;
        this.transition = transition;
    }

    toString() {
        return `["${this.from}", "${this.to}", ${this.transition}]`;
    }
}

export function isProjectionType(value: unknown): value is ProjectionTypeSpecification {
    return isPrimitiveProjection(value) || isProjectionTransition(value) || isPropertyValueSpecification(value);
}

export function isPropertyValueSpecification(value: unknown): value is PropertyValueSpecification<ProjectionTransition> {

    if (['interpolate-projection', 'step', 'literal'].includes(value[0])) {
        return true
    }
    return false
}

export function isProjectionTransition(value: unknown): value is ProjectionTransition {
    return Array.isArray(value) &&
        value.length === 3 &&
        isPrimitiveProjection(value[0]) &&
        isPrimitiveProjection(value[1]) &&
        typeof value[2] === 'number';
}

export function isPrimitiveProjection(value: unknown): value is PrimitiveProjection {
    return value === 'mercator' || value === 'globe';
}
import v8 from '../reference/v8.json' with { type: 'json' };
import {ProjectionPrimitive, ProjectionTransition, ProjectionTransitionSpecification, PropertyValueSpecification} from '../types.g';

export class Projection {
    readonly from: ProjectionPrimitive;
    readonly to: ProjectionPrimitive;
    readonly transition: number;
    constructor(from: ProjectionPrimitive, to: ProjectionPrimitive, transition: number){
        this.from = from;
        this.to = to;
        this.transition = transition;
    }

    toString() {
        return `["${this.from}", "${this.to}", ${this.transition}]`;
    }
}

export function isProjectionTransitionConfig(value: unknown): value is ProjectionTransitionSpecification {
    return isProjectionPrimitive(value) || isProjectionTransitionValue(value) || isPropertyValueSpecification(value);
}

export function isPropertyValueSpecification(value: unknown): value is PropertyValueSpecification<ProjectionTransition> {

    if (['interpolate-projection', 'step', 'literal'].includes(value[0])) {
        return true
    }
    return false
}

export function isProjectionTransitionValue(value: unknown): value is ProjectionTransition {
    return Array.isArray(value) &&
        value.length === 3 &&
        isProjectionPrimitive(value[0]) &&
        isProjectionPrimitive(value[1]) &&
        typeof value[2] === 'number';
}

export function isProjectionPrimitive(value: unknown): value is ProjectionPrimitive {
    return v8.projection.type.values.projections.includes(value as string);
}

export function isProjectionPreset(value: unknown): value is ProjectionPrimitive {
    return v8.projection.type.values.presets.includes(value as string);
}
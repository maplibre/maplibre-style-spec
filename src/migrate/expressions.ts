import {eachLayer, eachProperty} from '../visit';
import {isExpression} from '../expression';
import {convertFunction, convertTokenString} from '../function/convert';
import {convertFilter} from '../feature_filter/convert';

import type {FilterSpecification, LayerSpecification, StyleSpecification} from '../types.g';

/**
 * Migrate the given style object in place to use expressions. Specifically,
 * this will convert (a) "stop" functions, and (b) legacy filters to their
 * expression equivalents.
 * @param style The style object to migrate.
 * @returns The migrated style object.
 */
export function expressions(style: StyleSpecification) {
    const converted = [];

    eachLayer(style, (layer: LayerSpecification & { filter?: FilterSpecification }) => {
        if (layer.filter) {
            layer.filter = convertFilter(layer.filter);
        }
    });

    eachProperty(style, {paint: true, layout: true}, ({path, key, value, reference, set}) => {
        if (isExpression(value) || key.endsWith('-transition') || reference === null) return;
        if (typeof value === 'object' && !Array.isArray(value)) {
            set(convertFunction(value, reference));
            converted.push(path.join('.'));
        } else if ((reference as any).tokens && typeof value === 'string') {
            set(convertTokenString(value));
        }
    });

    return style;
}


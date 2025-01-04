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
            layer.filter = convertGeometryType(layer.filter);
        }
    });

    eachProperty(style, {paint: true, layout: true}, ({path, value, reference, set}) => {
        if (isExpression(value)) {
            set(convertGeometryType(value));
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            set(convertGeometryType(convertFunction(value, reference)));
            converted.push(path.join('.'));
        } else if ((reference as any).tokens && typeof value === 'string') {
            set(convertGeometryType(convertTokenString(value)));
        }
    });

    return style;
}

const v21NonMultiGeometryType = [
    'case',
    ['==', ['slice', ['geometry-type'], 0, 5], 'Multi'],
    ['slice', ['geometry-type'], 5],
    ['geometry-type'],
];

function convertGeometryType(expression) {
    if (!Array.isArray(expression)) {
        return expression;
    }
    // idempotency
    if (JSON.stringify(expression) === JSON.stringify(v21NonMultiGeometryType)) {
        return expression;
    }
    if (expression.length === 1 && expression[0] === 'geometry-type') {
        return v21NonMultiGeometryType;
    }
    return expression.map(convertGeometryType);
}

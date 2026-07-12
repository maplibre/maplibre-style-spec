import {describe, expect, test} from 'vitest';
import {validateStyleMin} from '../validate_style.min';
import type {FilterSpecification, StyleSpecification} from '../types.g';

function validateFilterInStyle(filter: unknown) {
    const style = {
        version: 8,
        sources: {s: {type: 'vector', tiles: ['http://example.com/{z}/{x}/{y}.pbf']}},
        layers: [
            {
                id: 'l',
                type: 'line',
                source: 's',
                'source-layer': 'sl',
                filter: filter as FilterSpecification
            }
        ]
    } as StyleSpecification;

    const issues = validateStyleMin(style);
    return {
        errors: issues.filter((issue) => issue.severity !== 'warning'),
        warnings: issues.filter((issue) => issue.severity === 'warning')
    };
}

describe('validateFilter mixed legacy/expression syntax (#1751)', () => {
    test('pure legacy filter containing `has` is valid', () => {
        // Reported in #1751: `["has", key]` is valid legacy syntax, but was being read as proof
        // that the surrounding tree was an expression, which then made its legacy siblings look
        // like illegal mixing.
        const {errors, warnings} = validateFilterInStyle([
            'all',
            ['==', '$type', 'LineString'],
            ['all', ['==', 'class', 'rail'], ['has', 'service']]
        ]);

        expect(errors).toEqual([]);
        expect(warnings).toEqual([]);
    });

    test('`has` alongside a genuine expression is valid', () => {
        const {errors, warnings} = validateFilterInStyle([
            'all',
            ['==', ['get', 'class'], 'rail'],
            ['has', 'service']
        ]);

        expect(errors).toEqual([]);
        expect(warnings).toEqual([]);
    });

    test('genuinely mixed filter warns instead of erroring, so the style still loads', () => {
        const {errors, warnings} = validateFilterInStyle([
            'all',
            ['==', ['get', 'type'], 'stream'],
            ['!', ['in', 'name', '']]
        ]);

        expect(errors).toEqual([]);
        expect(warnings).toHaveLength(1);
        expect(warnings[0].severity).toBe('warning');
        expect(warnings[0].message).toBe(
            'layers[0].filter[2][1]: Mixing deprecated filter syntax with expression syntax is not supported. Replace ["in","name",""] with ["in",["get","name"],["literal",[""]]].'
        );
    });

    test('a filter that cannot compile still reports a fatal error alongside the warning', () => {
        const {errors, warnings} = validateFilterInStyle([
            'all',
            ['>=', 'Constructi', 1930],
            ['>=', ['zoom'], 10]
        ]);

        expect(warnings).toHaveLength(1);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            "layers[0].filter[1]: Cannot compare types 'string' and 'number'."
        );
    });

    test('severity is absent on ordinary errors, so existing consumers are unaffected', () => {
        const {errors} = validateFilterInStyle(['==', 'class']);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].severity).toBeUndefined();
    });
});

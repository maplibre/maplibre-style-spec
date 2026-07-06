import {validateStyleMin} from '../validate_style.min';
import {describe, test, expect} from 'vitest';
import type {StyleSpecification} from '../types.g';

function styleWithEdgeRadius(edgeRadius: unknown): StyleSpecification {
    return {
        version: 8,
        sources: {
            geojson: {
                type: 'geojson',
                data: {type: 'FeatureCollection', features: []}
            }
        },
        layers: [
            {
                id: 'buildings',
                type: 'fill-extrusion',
                source: 'geojson',
                layout: {
                    'fill-extrusion-edge-radius': edgeRadius
                }
            }
        ]
    } as StyleSpecification;
}

describe('fill-extrusion-edge-radius validation', () => {
    test('accepts a constant number', () => {
        const errors = validateStyleMin(styleWithEdgeRadius(8));
        expect(errors).toHaveLength(0);
    });

    test('accepts the default of 0', () => {
        const errors = validateStyleMin(styleWithEdgeRadius(0));
        expect(errors).toHaveLength(0);
    });

    test('accepts a non-interpolated zoom camera expression', () => {
        const errors = validateStyleMin(styleWithEdgeRadius(['step', ['zoom'], 0, 14, 4]));
        expect(errors).toHaveLength(0);
    });

    test('rejects an interpolate expression (property is non-interpolated)', () => {
        const errors = validateStyleMin(
            styleWithEdgeRadius(['interpolate', ['linear'], ['zoom'], 14, 0, 16, 4])
        );
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/fill-extrusion-edge-radius/);
    });

    test('rejects a string value', () => {
        const errors = validateStyleMin(styleWithEdgeRadius('wide'));
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/fill-extrusion-edge-radius/);
    });

    test('rejects a negative value below the minimum', () => {
        const errors = validateStyleMin(styleWithEdgeRadius(-3));
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/fill-extrusion-edge-radius/);
    });
});

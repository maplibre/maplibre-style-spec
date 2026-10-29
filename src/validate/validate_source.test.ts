import {describe, test, expect} from 'vitest';
import v8 from '../reference/v8.json' with {type: 'json'};
import {validate} from './validate';
import {validateSource} from './validate_source';
import type {RasterSourceSpecification} from '../types.g';

describe('Validate source', () => {
    test('accepts raster premultiply configuration', () => {
        const errors = validateSource({
            key: 'source',
            value: {
                type: 'raster',
                tiles: ['http://example.com/{z}/{x}/{y}.png'],
                premultiply: false
            } as RasterSourceSpecification,
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });

        expect(errors).toHaveLength(0);
    });

    test('rejects non-boolean raster premultiply values', () => {
        const errors = validateSource({
            key: 'source',
            value: {
                type: 'raster',
                tiles: ['http://example.com/{z}/{x}/{y}.png'],
                premultiply: 'nope' as any
            } as RasterSourceSpecification,
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('premultiply');
        expect(errors[0].message).toContain('boolean');
        expect(errors[0].message).toContain('string');
    });
});

import {validateSource} from './validate_source';
import {validate} from './validate';
import {describe, test, expect} from 'vitest';
import v8 from '../reference/v8.json' with {type: 'json'};

describe('Validate source', () => {
    test('Unspecified encoding is valid', () => {
        const errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source'
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(0);
    });

    test('Explicit default mapbox encoding is valid', () => {
        const errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: 'mapbox'
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(0);
    });

    test('Explicit default maplibre encoding is valid', () => {
        const errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: 'maplibre'
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(0);
    });

    test('Other strings are rejected', () => {
        var errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: ''
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('source.encoding: expected one of [mapbox, maplibre], "" found');

        errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: 'custom'
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('source.encoding: expected one of [mapbox, maplibre], "custom" found');
    });

    test('Other types are rejected', () => {
        var errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: 3
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('source.encoding: expected one of [mapbox, maplibre], 3 found');

        errors = validateSource({
            key: 'source',
            value: {
                type: 'vector',
                url: 'https://example.com/source',
                encoding: ['mapbox']
            },
            styleSpec: v8,
            style: {} as any,
            validateSpec: validate
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('source.encoding: expected one of [mapbox, maplibre], ["mapbox"] found');
    });
});

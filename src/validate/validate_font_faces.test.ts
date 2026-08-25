import {describe, expect, test} from 'vitest';
import {validateFontFaces} from './validate_font_faces';
import {validate} from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import type {StyleSpecification} from '../types.g';

describe('validateFontFaces', () => {
    test('rejects a font entry that is a bare object rather than an array', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: {url: 'https://example.com/unifont.ttf'}},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont: string or array expected, object found'
        ]);
    });

    test('rejects a font entry that is null', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: null},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont: string or array expected, null found'
        ]);
    });

    test('rejects a font face that is not an object', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: ['https://example.com/unifont.ttf']},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont[0]: object expected, string found'
        ]);
    });

    test('leaves a unicode-range that is not an array to the array validation', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: [{url: 'https://example.com/a.ttf', 'unicode-range': 'U+0-7F'}]},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont[0].unicode-range: array expected, string found'
        ]);
    });

    test('leaves a unicode-range entry that is not a string to the array validation', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: [{url: 'https://example.com/a.ttf', 'unicode-range': [42]}]},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont[0].unicode-range[0]: string expected, number found'
        ]);
    });

    test('accepts a unicode range that is a single code point', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: [{url: 'https://example.com/a.ttf', 'unicode-range': ['U+26']}]},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([]);
    });

    test('accepts a wildcard unicode range', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {
                Unifont: [
                    {url: 'https://example.com/a.ttf', 'unicode-range': ['U+4??', 'U+??????']}
                ]
            },
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([]);
    });

    test('rejects a wildcard unicode range longer than six characters', () => {
        const errors = validateFontFaces({
            key: 'font-faces',
            value: {Unifont: [{url: 'https://example.com/a.ttf', 'unicode-range': ['U+0???????']}]},
            styleSpec: v8,
            style: {} as StyleSpecification,
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont[0].unicode-range[0]: invalid unicode range, expected a value such as "U+26", "U+0-10FFFF" or "U+4??"'
        ]);
    });

    test('defaults the key and the style spec when called as a standalone validator', () => {
        const errors = validateFontFaces({
            value: {Unifont: [{url: 'https://example.com/a.ttf', size: 12}]},
            validateSpec: validate
        });

        expect(errors.map((error) => error.message)).toEqual([
            'font-faces.Unifont[0]: unknown property "size"'
        ]);
    });
});

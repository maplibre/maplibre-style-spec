import {validateFontFaces} from './validate_font_faces';
import {validate} from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import type {StyleSpecification} from '../types.g';
import {describe, test, expect} from 'vitest';

describe('Validate FontFaces', () => {
    test('Should return error if font-faces is not an object', () => {
        let errors = validateFontFaces({validateSpec: validate, key: 'font-faces', value: 'invalid', styleSpec: v8, style: {} as StyleSpecification});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces: object expected, string found');

        errors = validateFontFaces({validateSpec: validate, key: 'font-faces', value: [], styleSpec: v8, style: {} as StyleSpecification});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces: object expected, array found');

        errors = validateFontFaces({validateSpec: validate, key: 'font-faces', value: 123, styleSpec: v8, style: {} as StyleSpecification});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces: object expected, number found');

        errors = validateFontFaces({validateSpec: validate, key: 'font-faces', value: true, styleSpec: v8, style: {} as StyleSpecification});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces: object expected, boolean found');
    });

    test('Should return error if font value is neither string nor array', () => {
        let errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {'Noto Sans': 123},
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces.Noto Sans: string or array expected, number found');

        errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {'Noto Sans': true},
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces.Noto Sans: string or array expected, boolean found');

        errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {'Noto Sans': {invalid: 'object'}},
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces.Noto Sans: string or array expected, object found');

        errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {'Noto Sans': null},
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('font-faces.Noto Sans: string or array expected, null found');
    });

    test('Should pass if font value is a string', () => {
        const errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {'Noto Sans': 'https://example.com/font.ttf'},
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(0);
    });

    test('Should pass if font value is an array of valid font face objects', () => {
        const errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {
                'Noto Sans': [{
                    url: 'https://example.com/font.ttf',
                    'unicode-range': ['U+1780-17FF']
                }]
            },
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return error if array contains invalid font face objects', () => {
        const errors = validateFontFaces({
            validateSpec: validate,
            key: 'font-faces',
            value: {
                'Noto Sans': [{
                    url: 'https://example.com/font.ttf'
                }, {
                    invalid: 'property'
                }]
            },
            styleSpec: v8,
            style: {} as StyleSpecification
        });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.message.includes('missing required property "url"'))).toBe(true);
    });
});


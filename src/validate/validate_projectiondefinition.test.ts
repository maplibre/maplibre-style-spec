import {validateProjectionDefinition} from './validate_projectiondefinition';
import {describe, test, expect} from 'vitest';

describe('validateProjection function', () => {
    const key = 'sample_projection_key';

    test('should return error when projection is not a string or array', () => {
        expect(validateProjectionDefinition({key, value: ''})).toHaveLength(0);

        expect(validateProjectionDefinition({key, value: 0})).toMatchObject([
            {message: `${key}: projection expected, invalid type "number" found`}
        ]);
        expect(validateProjectionDefinition({key, value: {}})).toMatchObject([
            {message: `${key}: projection expected, invalid type "object" found`}
        ]);
        expect(validateProjectionDefinition({key, value: false})).toMatchObject([
            {message: `${key}: projection expected, invalid type "boolean" found`}
        ]);
        expect(validateProjectionDefinition({key, value: null})).toMatchObject([
            {message: `${key}: projection expected, invalid type "null" found`}
        ]);
        expect(validateProjectionDefinition({key, value: undefined})).toMatchObject([
            {message: `${key}: projection expected, invalid type "undefined" found`}
        ]);
    });

    test('Should error when projection is an invalid projection transition', () => {
        const errors = validateProjectionDefinition({value: [3, 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid array [3,\"mercator\",0.3] found`}
        ]);
    });

    test('Should allow string', () => {
        const errors = validateProjectionDefinition({value: 'mercator', key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid projection transition', () => {
        const errors = validateProjectionDefinition({value: ['mercator', 'mercator', 0.3], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid interpolation-projection expression', () => {
        const errors = validateProjectionDefinition({
            value: ['interpolate', ['linear'], ['zoom'], 0, 'mercator', 5, 'vertical-perspective'],
            key
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid step expression', () => {
        const errors = validateProjectionDefinition({
            value: ['step', ['zoom'], 'vertical-perspective', 10, 'mercator'],
            key
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid step expression with a transition', () => {
        const errors = validateProjectionDefinition({
            value: ['step', ['zoom'], ['vertical-perspective', 'mercator', 0.5], 10, 'mercator'],
            key
        });
        expect(errors).toHaveLength(0);
    });
});

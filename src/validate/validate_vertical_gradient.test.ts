import {validate} from './validate';
import {validateVerticalGradient} from './validate_vertical_gradient';
import {describe, test, expect} from 'vitest';

describe('Validate VerticalGradient', () => {
    test('Should return error if type is not boolean or array', () => {
        let errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: '3'
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient: boolean expected, string found'
        );

        errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: 1
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient: boolean expected, number found'
        );

        errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: null
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient: boolean expected, null found'
        );
    });

    test('Should pass if type is boolean', () => {
        let errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: true
        });
        expect(errors).toHaveLength(0);

        errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: false
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return error if array length is invalid', () => {
        let errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: []
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient: fill-extrusion-vertical-gradient array requires 1 or 2 values; 0 values found'
        );

        errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: [0.5, 150, 1]
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient: fill-extrusion-vertical-gradient array requires 1 or 2 values; 3 values found'
        );
    });

    test('Should return error if depth is out of range', () => {
        const errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: [1.5]
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient[0]: 1.5 is greater than the maximum value 1'
        );
    });

    test('Should return error if referenceHeight is negative', () => {
        const errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: [0.5, -10]
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'fill-extrusion-vertical-gradient[1]: -10 is less than the minimum value 0'
        );
    });

    test('Should pass with a valid array', () => {
        let errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: [0.5]
        });
        expect(errors).toHaveLength(0);

        errors = validateVerticalGradient({
            validateSpec: validate,
            key: 'fill-extrusion-vertical-gradient',
            value: [0.5, 150]
        });
        expect(errors).toHaveLength(0);
    });
});

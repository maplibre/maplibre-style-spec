import validateProjectionTransition from './validate_projection_type';

describe('validateProjectionTransition function', () => {

    const key = 'sample_projectionTransition_key';

    test('should return error when projectionTransition is not a string or array', () => {
        expect(validateProjectionTransition({key, value: 0})).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid type "number" found`},
        ]);
        expect(validateProjectionTransition({key, value: {}})).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid type "object" found`},
        ]);
        expect(validateProjectionTransition({key, value: false})).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid type "boolean" found`},
        ]);
        expect(validateProjectionTransition({key, value: null})).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid type "null" found`},
        ]);
        expect(validateProjectionTransition({key, value: undefined})).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid type "undefined" found`},
        ]);
    });
    
    test('should return no errors when projectionTransition is valid projection string', () => {
        const validProjectionTransitionString = [
            'mercator',
            'stereographic',
            'globe',
        ];

        for (const value of validProjectionTransitionString) {
            const errors = validateProjectionTransition({key, value});
            expect(errors).toHaveLength(0);
        }
    });
    test('should errors when projectionTransition is invalid projection primitive or preset', () => {
        const invalidProjectionTransitionString = [
            'incalid',
        ];

        for (const value of invalidProjectionTransitionString) {
            const errors = validateProjectionTransition({key, value});
            expect(errors).toHaveLength(1);
        }
    });
    
    test('Should error when projectionTransition is an invalid projection transition', () => {
        const errors = validateProjectionTransition({value: [3, 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid array [3,\"mercator\",0.3] found`},
        ]);
    });

    test('Should error when preset is used as primitive', () => {
        const errors = validateProjectionTransition({value: ['globe', 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projectionTransition expected, invalid array [\"globe\",\"mercator\",0.3] found`},
        ]);
    });

    test('Should return no errors when projectionTransition is valid projection transition', () => {
        const errors = validateProjectionTransition({value: ['mercator', 'mercator', 0.3], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projectionTransition is valid interpolation-projection expression', () => {
        const errors = validateProjectionTransition({value: ['interpolate-projection', ['linear'], ['zoom'], 0, 'mercator', 5, 'globe'], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projectionTransition is valid step expression', () => {
        const errors = validateProjectionTransition({value: ['step', ['zoom'], 'globe', 10, 'mercator'], key});
        expect(errors).toHaveLength(0);
    });

});

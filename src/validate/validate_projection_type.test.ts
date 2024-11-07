import validateProjectionType from './validate_projection_type';

describe('validateProjectionType function', () => {

    const key = 'sample_projectionType_key';

    test('should return error when projectionType is not a string or array', () => {
        expect(validateProjectionType({key, value: 0})).toMatchObject([
            {message: `${key}: projectionType expected, invalid type "number" found`},
        ]);
        expect(validateProjectionType({key, value: {}})).toMatchObject([
            {message: `${key}: projectionType expected, invalid type "object" found`},
        ]);
        expect(validateProjectionType({key, value: false})).toMatchObject([
            {message: `${key}: projectionType expected, invalid type "boolean" found`},
        ]);
        expect(validateProjectionType({key, value: null})).toMatchObject([
            {message: `${key}: projectionType expected, invalid type "null" found`},
        ]);
        expect(validateProjectionType({key, value: undefined})).toMatchObject([
            {message: `${key}: projectionType expected, invalid type "undefined" found`},
        ]);
    });
    
    test('should return no errors when projectionType is valid projection string', () => {
        const validProjectionTypeString = [
            'mercator',
            'globe',
        ];

        for (const value of validProjectionTypeString) {
            const errors = validateProjectionType({key, value});
            expect(errors).toHaveLength(0);
        }
    });
    
    test('Should error when projectionType is an invalid projection transition', () => {
        const errors = validateProjectionType({value: [3, 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projectionType expected, invalid array [3,\"mercator\",0.3] found`},
        ]);
    });

    test('Should return no errors when projectionType is valid projection transition', () => {
        const errors = validateProjectionType({value: ['mercator', 'mercator', 0.3], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projectionType is valid interpolation-projection expression', () => {
        const errors = validateProjectionType({value: ['interpolate-projection', ['linear'], ['zoom'], 0, 'mercator', 5, 'globe'], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projectionType is valid step expression', () => {
        const errors = validateProjectionType({value: ['step', ['zoom'], 'globe', 10, 'mercator'], key});
        expect(errors).toHaveLength(0);
    });

});

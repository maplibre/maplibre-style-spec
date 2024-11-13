import validateProjection from './validate_projectiondefinition';

describe('validateProjection function', () => {

    const key = 'sample_projection_key';

    test('should return error when projection is not a string or array', () => {
        expect(validateProjection({key, value: ''})).toHaveLength(0);

        expect(validateProjection({key, value: 0})).toMatchObject([
            {message: `${key}: projection expected, invalid type "number" found`},
        ]);
        expect(validateProjection({key, value: {}})).toMatchObject([
            {message: `${key}: projection expected, invalid type "object" found`},
        ]);
        expect(validateProjection({key, value: false})).toMatchObject([
            {message: `${key}: projection expected, invalid type "boolean" found`},
        ]);
        expect(validateProjection({key, value: null})).toMatchObject([
            {message: `${key}: projection expected, invalid type "null" found`},
        ]);
        expect(validateProjection({key, value: undefined})).toMatchObject([
            {message: `${key}: projection expected, invalid type "undefined" found`},
        ]);
    });
    
    test('Should error when projection is an invalid projection transition', () => {
        const errors = validateProjection({value: [3, 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid array [3,\"mercator\",0.3] found`},
        ]);
    });

    test('Should allow string', () => {
        const errors = validateProjection({value: 'mercator', key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid projection transition', () => {
        const errors = validateProjection({value: ['mercator', 'mercator', 0.3], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid interpolation-projection expression', () => {
        const errors = validateProjection({value: ['interpolate', ['linear'], ['zoom'], 0, 'mercator', 5, 'vertical-perspective'], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid step expression', () => {
        const errors = validateProjection({value: ['step', ['zoom'], 'vertical-perspective', 10, 'mercator'], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid step expression with a transition', () => {
        const errors = validateProjection({value: ['step', ['zoom'], ['vertical-perspective', 'mercator', 0.5], 10, 'mercator'], key});
        expect(errors).toHaveLength(0);
    });

});

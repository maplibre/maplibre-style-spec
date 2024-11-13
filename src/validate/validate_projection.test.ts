import v8 from '../reference/v8.json' with {type: 'json'};
import validateProjection from './validate_projection';

describe('validateProjection function', () => {

    const key = 'sample_projection_key';

    test('should return error when projection is not a string or array', () => {
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
    
    test('should return no errors when projection is valid projection string', () => {
        const validProjectionString = [...Object.keys(v8.projectionConfig.type.values.presets), ...Object.keys(v8.projectionConfig.type.values.projections)] 
        
        for (const value of validProjectionString) {
            const errors = validateProjection({key, value});
            expect(errors).toHaveLength(0);
        }
    });
    test('should errors when projection is invalid projection primitive or preset', () => {
        const invalidProjectionString = [
            'incalid',
        ];

        for (const value of invalidProjectionString) {
            const errors = validateProjection({key, value});
            expect(errors).toHaveLength(1);
        }
    });
    
    test('Should error when projection is an invalid projection transition', () => {
        const errors = validateProjection({value: [3, 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid array [3,\"mercator\",0.3] found`},
        ]);
    });

    test('Should allow preset expression string', () => {
        const errors = validateProjection({value: 'globe', key});
        expect(errors).toHaveLength(0);
    });
  
    test('Should error if preset expression string is not defined', () => {
        const errors = validateProjection({value: 'unknownPreset', key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid string \"unknownPreset\" found`},
        ]);
    });
    
    test('Should allow primitive projection string', () => {
        const errors = validateProjection({value: 'mercator', key});
        expect(errors).toHaveLength(0);
    });

    test('Should error if primitive projection string is not defined', () => {
        const errors = validateProjection({value: 'unknownPrimitive', key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid string \"unknownPrimitive\" found`},
        ]);
    });

    test('Should error when preset is used as primitive', () => {
        const errors = validateProjection({value: ['globe', 'mercator', 0.3], key});
        expect(errors).toMatchObject([
            {message: `${key}: projection expected, invalid array [\"globe\",\"mercator\",0.3] found`},
        ]);
    });

    test('Should return no errors when projection is valid projection transition', () => {
        const errors = validateProjection({value: ['mercator', 'mercator', 0.3], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid interpolation-projection expression', () => {
        const errors = validateProjection({value: ['interpolate-projection', ['linear'], ['zoom'], 0, 'mercator', 5, 'vertical-perspective'], key});
        expect(errors).toHaveLength(0);
    });

    test('Should return no errors when projection is valid step expression', () => {
        const errors = validateProjection({value: ['step', ['zoom'], 'vertical-perspective', 10, 'mercator'], key});
        expect(errors).toHaveLength(0);
    });

});

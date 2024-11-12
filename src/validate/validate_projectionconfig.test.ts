import validateProjectionConfig from './validate_projectionconfig';
import validateSpec from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};

describe('Validate projection', () => {
    it('Should pass when value is undefined', () => {
        const errors = validateProjectionConfig({validateSpec, value: undefined, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateProjectionConfig({validateSpec, value: {a: 1} as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('a: unknown property \"a\"');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateProjectionConfig({validateSpec, value: 1 as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('projection: object expected, number found');
    });

    test('Should return error when value is null', () => {
        const errors = validateProjectionConfig({validateSpec, value: null as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('projection: object expected, null found');
    });

    test('Should pass step function', () => {
        const errors = validateProjectionConfig({validateSpec, value: {'type': ['step', ['zoom'], 'vertical-perspective', 10, 'mercator']}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should pass string value for single projection', () => {
        const errors = validateProjectionConfig({validateSpec, value: {'type': 'mercator'}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });
    
    test('Should pass string value for preset', () => {
        const errors = validateProjectionConfig({validateSpec, value: {'type': 'globe'}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should pass if [proj, proj, number]', () => {
        const errors = validateProjectionConfig({validateSpec, value: {'type': ['mercator', 'mercator', 0.3]}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('should parse iterpolate-projection', () => {
        const errors = validateProjectionConfig({validateSpec, value: {'type': ['interpolate-projection', ['linear'], ['zoom'], 0, 'mercator', 5, 'vertical-perspective']}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

});

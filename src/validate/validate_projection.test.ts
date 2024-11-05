import validateProjection from './validate_projection';
import validateSpec from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import {ProjectionSpecification} from '../types.g';

describe('Validate projection', () => {
    it('Should pass when value is undefined', () => {
        const errors = validateProjection({validateSpec, value: undefined, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should return error when value is not an object', () => {
        const errors = validateProjection({validateSpec, value: '' as unknown as ProjectionSpecification, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('object');
        expect(errors[0].message).toContain('expected');
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateProjection({validateSpec, value: {a: 1} as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('a');
        expect(errors[0].message).toContain('unknown');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateProjection({validateSpec, value: {type: 1 as any}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('type: expected one of [mercator, globe], 1 found');
    });

    test('Should pass if everything is according to spec', () => {
        let errors = validateProjection({validateSpec, value: {type: 'globe'}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
        errors = validateProjection({validateSpec, value: {type: 'mercator'}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });
});

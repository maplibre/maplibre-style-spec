import validateProjection from './validate_projection';
import validateSpec from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};

describe('Validate projection', () => {
    it('Should pass when value is undefined', () => {
        const errors = validateProjection({validateSpec, value: undefined, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateProjection({validateSpec, value: {a: 1} as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('projection: does not fit the type ProjectionTransition');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateProjection({validateSpec, value: 1 as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('projection: expected array, object, string - found number');
    });

    test('Should return error when value is null', () => {
        const errors = validateProjection({validateSpec, value: null as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('projection: expected array, object, string - found null');
    });

    test('Should pass if everything is according to spec', () => {
        let errors = validateProjection({validateSpec, value: ['step', ['zoom'], 'globe', 10, 'mercator'], styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
        errors = validateProjection({validateSpec, value: {'from': 'mercator', 'to': 'mercator', transition: 1}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
        errors = validateProjection({validateSpec, value: 'mercator', styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
        errors = validateProjection({validateSpec, value: ['interpolate-projection', ['linear'], ['zoom'], 0, 'mercator', 5, 'globe'], styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
  
    });

});

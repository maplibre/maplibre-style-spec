import {validateSky} from './validate_sky';
import {validate} from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import {SkySpecification} from '../types.g';
import {describe, test, expect, it} from 'vitest';

describe('Validate sky', () => {
    it('Should pass when value is undefined', () => {
        const errors = validateSky({
            validateSpec: validate,
            value: undefined,
            styleSpec: v8,
            style: {} as any
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return error when value is not an object', () => {
        const errors = validateSky({
            validateSpec: validate,
            value: '' as unknown as SkySpecification,
            styleSpec: v8,
            style: {} as any
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('object');
        expect(errors[0].message).toContain('expected');
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateSky({
            validateSpec: validate,
            value: {a: 1} as any,
            styleSpec: v8,
            style: {} as any
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('a');
        expect(errors[0].message).toContain('unknown');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateSky({
            validateSpec: validate,
            value: {
                'sky-color': 1 as any,
                'fog-color': 2 as any,
                'horizon-fog-blend': {} as any,
                'fog-ground-blend': 'foo' as any
            },
            styleSpec: v8,
            style: {} as any
        });
        expect(errors).toHaveLength(4);
        expect(errors[0].message).toBe('sky-color: color expected, number found');
        expect(errors[1].message).toBe('fog-color: color expected, number found');
        expect(errors[2].message).toBe('horizon-fog-blend: missing required property "stops"');
        expect(errors[3].message).toBe('fog-ground-blend: number expected, string found');
    });

    test('Should pass if everything is according to spec', () => {
        const errors = validateSky({
            validateSpec: validate,
            value: {
                'sky-color': 'red',
                'fog-color': '#123456',
                'horizon-fog-blend': 1,
                'fog-ground-blend': 0
            },
            styleSpec: v8,
            style: {} as any
        });
        expect(errors).toHaveLength(0);
    });
});

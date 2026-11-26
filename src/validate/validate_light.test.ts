import {validateLight} from './validate_light';
import {validate} from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import {describe, test, expect, it} from 'vitest';

function run(value: unknown) {
    return validateLight({
        validateSpec: validate,
        value,
        styleSpec: v8,
        style: {} as any
    });
}

describe('Validate light', () => {
    it('Should pass when value is undefined', () => {
        expect(run(undefined)).toHaveLength(0);
    });

    test('Should return error when value is not an object', () => {
        const errors = run('');
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('light: object expected, string found');
    });

    test('Should return error in case of unknown property', () => {
        const errors = run({a: 1});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('a: unknown property "a"');
    });

    test('Should pass if everything is according to spec', () => {
        expect(
            run({anchor: 'map', color: 'red', intensity: 0.5, position: [1, 90, 80]})
        ).toHaveLength(0);
    });

    test('Should pass when a transition property matches a transitionable light property', () => {
        expect(run({color: 'blue', 'color-transition': {duration: 1000}})).toHaveLength(0);
    });

    test('Should return error when a data expression is used', () => {
        expect(run({color: ['get', 'c']}).map((e) => e.message)).toEqual([
            'color: data expressions not supported'
        ]);
        expect(run({intensity: ['feature-state', 'c']}).map((e) => e.message)).toEqual([
            'intensity: data expressions not supported'
        ]);
    });

    test('Should return error when zoom is not the input of a top-level step or interpolate', () => {
        const errors = run({intensity: ['*', ['zoom'], 0.1]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'intensity: "zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.'
        );
    });

    test('Should pass a top-level zoom interpolation and step', () => {
        expect(
            run({intensity: ['interpolate', ['linear'], ['zoom'], 0, 0.1, 10, 0.9]})
        ).toHaveLength(0);
        expect(run({color: ['step', ['zoom'], 'red', 5, 'blue']})).toHaveLength(0);
        expect(run({anchor: ['step', ['zoom'], 'map', 5, 'viewport']})).toHaveLength(0);
    });
});

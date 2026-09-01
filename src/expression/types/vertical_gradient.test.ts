import {VerticalGradient} from './vertical_gradient';
import {describe, test, expect} from 'vitest';

describe('VerticalGradient', () => {
    test('VerticalGradient.parse', () => {
        expect(VerticalGradient.parse()).toBeUndefined();
        expect(VerticalGradient.parse(null)).toBeUndefined();
        expect(VerticalGradient.parse(undefined)).toBeUndefined();
        expect(VerticalGradient.parse('true' as any)).toBeUndefined();
        expect(VerticalGradient.parse([])).toBeUndefined();
        expect(VerticalGradient.parse([1, 2, 3])).toBeUndefined();
        expect(VerticalGradient.parse([1, '2'] as any)).toBeUndefined();

        expect(VerticalGradient.parse(true)).toEqual(new VerticalGradient(0.5, 150));
        expect(VerticalGradient.parse(false)).toEqual(new VerticalGradient(0, 0));
        expect(VerticalGradient.parse([0.7])).toEqual(new VerticalGradient(0.7, 0));
        expect(VerticalGradient.parse([0.7, 100])).toEqual(new VerticalGradient(0.7, 100));

        const passThru = new VerticalGradient(0.5, 150);
        expect(VerticalGradient.parse(passThru)).toBe(passThru);
    });

    test('VerticalGradient#toString', () => {
        const verticalGradient = new VerticalGradient(0.5, 150);
        expect(verticalGradient.toString()).toBe('[0.5,150]');
    });
});

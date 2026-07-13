import {Padding} from './padding';
import {describe, test, expect} from 'vitest';
describe('Padding', () => {
    test('Padding.parse', () => {
        expect(Padding.parse()).toBeUndefined();
        expect(Padding.parse(null)).toBeUndefined();
        expect(Padding.parse(undefined)).toBeUndefined();
        expect(Padding.parse('Dennis' as any)).toBeUndefined();
        expect(Padding.parse('3' as any)).toBeUndefined();
        expect(Padding.parse([])).toBeUndefined();
        expect(Padding.parse([3, '4'] as any)).toBeUndefined();
        expect(Padding.parse(5)).toEqual(new Padding([5, 5, 5, 5]));
        expect(Padding.parse([1])).toEqual(new Padding([1, 1, 1, 1]));
        expect(Padding.parse([1, 2])).toEqual(new Padding([1, 2, 1, 2]));
        expect(Padding.parse([1, 2, 3])).toEqual(new Padding([1, 2, 3, 2]));
        expect(Padding.parse([1, 2, 3, 4])).toEqual(new Padding([1, 2, 3, 4]));
        expect(Padding.parse([1, 2, 3, 4, 5])).toBeUndefined();

        const passThru = new Padding([1, 2, 3, 4]);
        expect(Padding.parse(passThru)).toBe(passThru);
    });

    test('Padding#toString', () => {
        const padding = new Padding([1, 2, 3, 4]);
        expect(padding.toString()).toBe('[1,2,3,4]');
    });

    test('interpolate padding', () => {
        const padding = new Padding([0, 0, 0, 0]);
        const targetPadding = new Padding([1, 2, 6, 4]);

        const i11nFn = (t: number) => Padding.interpolate(padding, targetPadding, t);
        expect(i11nFn(0.5)).toBeInstanceOf(Padding);
        expect(i11nFn(0.5)).toEqual(new Padding([0.5, 1, 3, 2]));
    });
});

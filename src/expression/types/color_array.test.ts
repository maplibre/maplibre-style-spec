import {Color} from './color';
import {ColorArray} from './color_array';
import {describe, test, expect} from 'vitest';

describe('ColorArray', () => {
    test('ColorArray.parse', () => {
        expect(ColorArray.parse()).toBeUndefined();
        expect(ColorArray.parse(null)).toBeUndefined();
        expect(ColorArray.parse(undefined)).toBeUndefined();
        expect(ColorArray.parse('Dennis' as any)).toBeUndefined();
        expect(ColorArray.parse('3' as any)).toBeUndefined();
        expect(ColorArray.parse('yellow').values).toEqual([Color.parse('yellow')]);
        expect(ColorArray.parse([]).values).toEqual([]);
        expect(ColorArray.parse(['yellow']).values).toEqual([Color.parse('yellow')]);
        expect(ColorArray.parse(['yellow', 'blue']).values).toEqual([Color.parse('yellow'), Color.parse('blue')]);
        expect(ColorArray.parse([3, 4] as any)).toBeUndefined();
        expect(ColorArray.parse(['non-color', 'words'] as any)).toBeUndefined();

        const passThru = new ColorArray([Color.parse('yellow'), Color.parse('blue')]);
        expect(ColorArray.parse(passThru)).toBe(passThru);
    });

    test('ColorArray#toString', () => {
        const colorArray = ColorArray.parse(['yellow', 'blue']);
        expect(colorArray.toString()).toBe('[{"r":1,"g":1,"b":0,"a":1},{"r":0,"g":0,"b":1,"a":1}]');
    });

    test('interpolate ColorArray', () => {
        const colorArray = ColorArray.parse(['#00A0AA', '#000000']);
        const targetColorArray = ColorArray.parse(['#AA0000', '#2468AC']);

        const i11nFn = (t: number) => ColorArray.interpolate(colorArray, targetColorArray, t);
        expect(i11nFn(0.5)).toBeInstanceOf(ColorArray);
        expect(i11nFn(0.5)).toEqual(ColorArray.parse(['#555055', '#123456']));
    });

    test('interpolate ColorArray with mismatched lengths', () => {
        const colorArray = ColorArray.parse(['#00A0AA', '#000000']);
        const targetColorArray = ColorArray.parse('#AA0000');

        expect(() => {ColorArray.interpolate(colorArray, targetColorArray, 0.5);}).toThrow('colorArray: Arrays have mismatched length (2 vs. 1), cannot interpolate.');
    });
});

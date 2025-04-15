import {NumberArray} from './number_array';

describe('NumberArray', () => {
    test('NumberArray.parse', () => {
        expect(NumberArray.parse()).toBeUndefined();
        expect(NumberArray.parse(null)).toBeUndefined();
        expect(NumberArray.parse(undefined)).toBeUndefined();
        expect(NumberArray.parse('Dennis' as any)).toBeUndefined();
        expect(NumberArray.parse('3' as any)).toBeUndefined();
        expect(NumberArray.parse([3, '4'] as any)).toBeUndefined();
        expect(NumberArray.parse(5)).toEqual(new NumberArray([5]));
        expect(NumberArray.parse([])).toEqual(new NumberArray([]));
        expect(NumberArray.parse([1])).toEqual(new NumberArray([1]));
        expect(NumberArray.parse([1, 2])).toEqual(new NumberArray([1, 2]));
        expect(NumberArray.parse([1, 2, 3])).toEqual(new NumberArray([1, 2, 3]));
        expect(NumberArray.parse([1, 2, 3, 4])).toEqual(new NumberArray([1, 2, 3, 4]));
        expect(NumberArray.parse([1, 2, 3, 4, 5])).toEqual(new NumberArray([1, 2, 3, 4, 5]));

        const passThru = new NumberArray([1, 2, 3, 4]);
        expect(NumberArray.parse(passThru)).toBe(passThru);
    });

    test('NumberArray#toString', () => {
        const numberArray = new NumberArray([1, 2, 3, 4]);
        expect(numberArray.toString()).toBe('[1,2,3,4]');
    });

    test('interpolate NumberArray', () => {
        const numberArray = new NumberArray([0, 0, 0, 0]);
        const targetNumberArray = new NumberArray([1, 2, 6, 4]);

        const i11nFn = (t: number) => NumberArray.interpolate(numberArray, targetNumberArray, t);
        expect(i11nFn(0.5)).toBeInstanceOf(NumberArray);
        expect(i11nFn(0.5)).toEqual(new NumberArray([0.5, 1, 3, 2]));
    });
});

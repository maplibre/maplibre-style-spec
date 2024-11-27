import {interpolateArray, interpolateNumber} from './interpolate-primitives';

describe('interpolate', () => {

    test('interpolate number', () => {
        expect(interpolateNumber(-5, 5, 0.00)).toBe(-5.0);
        expect(interpolateNumber(-5, 5, 0.25)).toBe(-2.5);
        expect(interpolateNumber(-5, 5, 0.50)).toBe(0);
        expect(interpolateNumber(-5, 5, 0.75)).toBe(2.5);
        expect(interpolateNumber(-5, 5, 1.00)).toBe(5.0);

        expect(interpolateNumber(0, 1, 0.5)).toBe(0.5);
        expect(interpolateNumber(-10, -5, 0.5)).toBe(-7.5);
        expect(interpolateNumber(5, 10, 0.5)).toBe(7.5);
    });

    test('interpolate array', () => {
        expect(interpolateArray([0, 0, 0, 0], [1, 2, 3, 4], 0.5)).toEqual([0.5, 1, 3 / 2, 2]);
    });
});

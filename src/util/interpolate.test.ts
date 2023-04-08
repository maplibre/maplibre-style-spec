import interpolate, {isSupportedInterpolationColorSpace} from './interpolate';
import Color from './color';
import Padding from './padding';

describe('interpolate', () => {

    test('interpolate number', () => {
        expect(interpolate.number(-5, 5, 0.00)).toBe(-5.0);
        expect(interpolate.number(-5, 5, 0.25)).toBe(-2.5);
        expect(interpolate.number(-5, 5, 0.50)).toBe(0);
        expect(interpolate.number(-5, 5, 0.75)).toBe(2.5);
        expect(interpolate.number(-5, 5, 1.00)).toBe(5.0);

        expect(interpolate.number(0, 1, 0.5)).toBe(0.5);
        expect(interpolate.number(-10, -5, 0.5)).toBe(-7.5);
        expect(interpolate.number(5, 10, 0.5)).toBe(7.5);
    });

    describe('interpolation color space', () => {

        test('should recognize supported interpolation color spaces', () => {
            expect(isSupportedInterpolationColorSpace('rgb')).toBe(true);
            expect(isSupportedInterpolationColorSpace('hcl')).toBe(true);
            expect(isSupportedInterpolationColorSpace('lab')).toBe(true);
        });

        test('should ignore invalid interpolation color spaces', () => {
            expect(isSupportedInterpolationColorSpace('sRGB')).toBe(false);
            expect(isSupportedInterpolationColorSpace('HCL')).toBe(false);
            expect(isSupportedInterpolationColorSpace('LCH')).toBe(false);
            expect(isSupportedInterpolationColorSpace('LAB')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate-hcl')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate-lab')).toBe(false);
        });

    });

    describe('interpolate color', () => {

        test('should interpolate colors in "rgb" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'rgb');
            expect(i11nFn(0.00)).toMatchColor('rgb(0% 0% 100% / 1)');
            expect(i11nFn(0.25)).toMatchColor('rgb(0% 25% 75% / 0.9)');
            expect(i11nFn(0.50)).toMatchColor('rgb(0% 50% 50% / 0.8)');
            expect(i11nFn(0.75)).toMatchColor('rgb(0% 75% 25% / 0.7)');
            expect(i11nFn(1.00)).toMatchColor('rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "hcl" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'hcl');
            expect(i11nFn(0.00)).toMatchColor('rgb(0% 0% 100% / 1)');
            expect(i11nFn(0.25)).toMatchColor('rgb(0% 53.05% 100% / 0.9)', 4);
            expect(i11nFn(0.50)).toMatchColor('rgb(0% 72.97% 100% / 0.8)', 4);
            expect(i11nFn(0.75)).toMatchColor('rgb(0% 88.42% 67.80% / 0.7)', 4);
            expect(i11nFn(1.00)).toMatchColor('rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "lab" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'lab');
            expect(i11nFn(0.00)).toMatchColor('rgb(0% 0% 100% / 1)');
            expect(i11nFn(0.25)).toMatchColor('rgb(42.40% 35.65% 82.90% / 0.9)', 4);
            expect(i11nFn(0.50)).toMatchColor('rgb(49.19% 57.81% 65.10% / 0.8)', 4);
            expect(i11nFn(0.75)).toMatchColor('rgb(43.61% 78.93% 44.66% / 0.7)', 4);
            expect(i11nFn(1.00)).toMatchColor('rgb(0% 100% 0% / 0.6)');
        });

        test('should correctly interpolate colors with alpha=0', () => {
            const color = Color.parse('rgba(0,0,255,0)');
            const targetColor = Color.parse('rgba(0,255,0,1)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'rgb');
            expect(i11nFn(0.00)).toMatchColor('rgb(0% 0% 0% / 0)');
            expect(i11nFn(0.25)).toMatchColor('rgb(0% 25% 75% / 0.25)');
            expect(i11nFn(0.50)).toMatchColor('rgb(0% 50% 50% / 0.5)');
            expect(i11nFn(0.75)).toMatchColor('rgb(0% 75% 25% / 0.75)');
            expect(i11nFn(1.00)).toMatchColor('rgb(0% 100% 0% / 1)');
        });

        test('should limit interpolation results to sRGB gamut', () => {
            const color = Color.parse('royalblue');
            const targetColor = Color.parse('cyan');

            for (const space of ['rgb', 'hcl', 'lab'] as const) {
                const i11nFn = (t: number) => interpolate.color(color, targetColor, t, space);
                const colorInBetween = i11nFn(0.5);
                for (const key of ['r', 'g', 'b', 'a'] as const) {
                    expect(colorInBetween[ key ]).toBeGreaterThanOrEqual(0);
                    expect(colorInBetween[ key ]).toBeLessThanOrEqual(1);
                }
            }
        });

    });

    test('interpolate array', () => {
        expect(interpolate.array([0, 0, 0, 0], [1, 2, 3, 4], 0.5)).toEqual([0.5, 1, 3 / 2, 2]);
    });

    test('interpolate padding', () => {
        const padding = new Padding([0, 0, 0, 0]);
        const targetPadding = new Padding([1, 2, 6, 4]);

        const i11nFn = (t: number) => interpolate.padding(padding, targetPadding, t);
        expect(i11nFn(0.5)).toBeInstanceOf(Padding);
        expect(i11nFn(0.5)).toEqual(new Padding([0.5, 1, 3, 2]));
    });

});

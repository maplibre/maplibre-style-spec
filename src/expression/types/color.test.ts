import {expectCloseToArray, expectToMatchColor} from '../../../test/lib/util';
import {Color, isSupportedInterpolationColorSpace} from './color';
import {describe, test, expect} from 'vitest';

describe('Color class', () => {
    describe('parsing', () => {
        test('should parse valid css color strings', () => {
            expectToMatchColor(Color.parse('RED'), 'rgb(100% 0% 0% / 1)');
            expectToMatchColor(Color.parse('#f00C'), 'rgb(100% 0% 0% / .8)');
            expectToMatchColor(Color.parse('rgb(0 0 127.5 / 20%)'), 'rgb(0% 0% 50% / .2)');
            expectToMatchColor(
                Color.parse('hsl(300deg 100% 25.1% / 0.7)'),
                'rgb(50.2% 0% 50.2% / .7)'
            );
        });

        test('should return undefined when provided with invalid CSS color string', () => {
            expect(Color.parse(undefined)).toBeUndefined();
            expect(Color.parse(null)).toBeUndefined();
            expect(Color.parse('#invalid')).toBeUndefined();
            expect(Color.parse('$123')).toBeUndefined();
            expect(Color.parse('0F91')).toBeUndefined();
            expect(Color.parse('rgb(#123)')).toBeUndefined();
            expect(Color.parse('hsl(0,0,0)')).toBeUndefined();
            expect(Color.parse('rgb(0deg,0,0)')).toBeUndefined();
        });

        test('should accept instances of Color class', () => {
            const color = new Color(0, 0, 0, 0);
            expect(Color.parse(color)).toBe(color);
        });
    });

    test('should keep a reference to the original color when alpha=0', () => {
        const color = new Color(0, 0, 0.5, 0, false);
        expect(color).toMatchObject({r: 0, g: 0, b: 0, a: 0});
        expect(Object.hasOwn(color, 'rgb')).toBe(true);
        expectCloseToArray(color.rgb, [0, 0, 0.5, 0]);
    });

    test('should have static properties, black', () => {
        const color = Color.black;
        expect(color).toMatchObject({r: 0, g: 0, b: 0, a: 1});
        expectCloseToArray(color.rgb, [0, 0, 0, 1]);
    });

    test('should not keep a reference to the original color when alpha!=0', () => {
        const color = new Color(0, 0, 0.5, 0.001, false);
        expect(color).toMatchObject({r: 0, g: 0, b: expect.closeTo(0.5 * 0.001, 5), a: 0.001});
        expect(Object.hasOwn(color, 'rgb')).toBe(false);
    });

    test('should serialize to rgba format', () => {
        expect(`${new Color(1, 1, 0, 1, false)}`).toBe('rgba(255,255,0,1)');
        expect(`${new Color(0.2, 0, 1, 0.3, false)}`).toBe('rgba(51,0,255,0.3)');
        expect(`${new Color(1, 1, 0, 0, false)}`).toBe('rgba(255,255,0,0)');
        expect(`${Color.parse('purple')}`).toBe('rgba(128,0,128,1)');
        expect(`${Color.parse('rgba(26,207,26,.73)')}`).toBe('rgba(26,207,26,0.73)');
        expect(`${Color.parse('rgba(26,207,26,0)')}`).toBe('rgba(26,207,26,0)');
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

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'rgb');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 25% 75% / 0.9)');
            expectToMatchColor(i11nFn(0.5), 'rgb(0% 50% 50% / 0.8)');
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 75% 25% / 0.7)');
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "hcl" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'hcl');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 49.37% 100% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.5), 'rgb(0% 70.44% 100% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 87.54% 63.18% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "lab" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'lab');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(39.64% 34.55% 83.36% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.5), 'rgb(46.42% 56.82% 65.91% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(41.45% 78.34% 45.62% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should correctly interpolate colors with alpha=0', () => {
            const color = Color.parse('rgba(0,0,255,0)');
            const targetColor = Color.parse('rgba(0,255,0,1)');

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'rgb');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 0% / 0)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 25% 75% / 0.25)');
            expectToMatchColor(i11nFn(0.5), 'rgb(0% 50% 50% / 0.5)');
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 75% 25% / 0.75)');
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 1)');
        });

        test('should limit interpolation results to sRGB gamut', () => {
            const color = Color.parse('royalblue');
            const targetColor = Color.parse('cyan');

            for (const space of ['rgb', 'hcl', 'lab'] as const) {
                const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, space);
                const colorInBetween = i11nFn(0.5);
                for (const key of ['r', 'g', 'b', 'a'] as const) {
                    expect(colorInBetween[key]).toBeGreaterThanOrEqual(0);
                    expect(colorInBetween[key]).toBeLessThanOrEqual(1);
                }
            }
        });
    });
});

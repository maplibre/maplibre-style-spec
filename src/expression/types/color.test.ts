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

        test('should clip a color outside sRGB channel by channel', () => {
            expect(Color.parse('color(display-p3 0 1 0)')).toMatchObject({r: 0, g: 1, b: 0, a: 1});
            expect(Color.parse('color(display-p3 1e200 0 0)')).toMatchObject({
                r: 1,
                g: 0,
                b: 0,
                a: 1
            });
            expect(Color.parse('oklch(0.6 1e110 90)')).toMatchObject({r: 0, g: 1, b: 0, a: 1});
            expect(Color.parse('oklab(0.6 0 1e110)')).toMatchObject({r: 0, g: 1, b: 0, a: 1});
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

    describe('Display P3', () => {
        test('should convert a color inside sRGB', () => {
            expectCloseToArray(Color.parse('red').displayP3, [0.917488, 0.200287, 0.138561, 1]);
        });

        test('should keep a color outside sRGB', () => {
            expectCloseToArray(Color.parse('color(display-p3 0 1 0)').displayP3, [0, 1, 0, 1]);
            expectCloseToArray(
                Color.parse('oklch(0.7 0.25 140)').displayP3,
                [0.355268, 0.741266, 0.121981, 1]
            );
        });

        test('should clip a color outside Display P3 channel by channel', () => {
            expectCloseToArray(
                Color.parse('color(display-p3 1.2 -0.1 0.3)').displayP3,
                [1, 0, 0.3, 1]
            );
            expectCloseToArray(Color.parse('oklch(0.7 0.4 140)').displayP3, [0, 0.790331, 0, 1]);
        });

        test('should keep the channels of a transparent color', () => {
            const color = Color.parse('color(display-p3 0 1 0 / 0)');
            expect(color).toMatchObject({r: 0, g: 0, b: 0, a: 0});
            expectCloseToArray(color.rgb, [0, 1, 0, 0]);
            expectCloseToArray(color.displayP3, [0, 1, 0, 0]);
        });
    });

    describe('interpolation color space', () => {
        test('should recognize supported interpolation color spaces', () => {
            expect(isSupportedInterpolationColorSpace('rgb')).toBe(true);
            expect(isSupportedInterpolationColorSpace('hcl')).toBe(true);
            expect(isSupportedInterpolationColorSpace('lab')).toBe(true);
            expect(isSupportedInterpolationColorSpace('oklch')).toBe(true);
            expect(isSupportedInterpolationColorSpace('oklab')).toBe(true);
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

        test('should interpolate colors in "oklch" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'oklch');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 42.96% 98.46% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.5), 'rgb(0% 66.57% 82.63% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 84.88% 56.87% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate hue the shorter way around in "oklch" color space', () => {
            const color = Color.parse('oklch(0.6 0.15 350)');
            const targetColor = Color.parse('oklch(0.7 0.12 20)');

            expectToMatchColor(
                Color.interpolate(color, targetColor, 0.5, 'oklch'),
                'rgb(82.23% 40.99% 51.77% / 1)',
                4
            );
        });

        test('should take the hue of the other color for a gray in "oklch" color space', () => {
            const gray = Color.parse('#808080');
            const blue = Color.parse('oklch(0.6 0.12 250)');

            expectToMatchColor(
                Color.interpolate(gray, blue, 0.5, 'oklch'),
                'rgb(39.56% 51.49% 63.99% / 1)',
                4
            );
            expectToMatchColor(
                Color.interpolate(blue, gray, 0.5, 'oklch'),
                'rgb(39.56% 51.49% 63.99% / 1)',
                4
            );
            expectToMatchColor(
                Color.interpolate(
                    Color.transparent,
                    Color.parse('oklch(0.7 0.1 150)'),
                    0.5,
                    'oklch'
                ),
                'rgb(43.63% 69.06% 49.07% / 0.5)',
                4
            );
        });

        test('should premultiply lightness and chroma by alpha in "oklch" color space', () => {
            const color = Color.parse('oklch(0.7 0.1 30 / 0.2)');
            const targetColor = Color.parse('oklch(0.5 0.1 250)');

            expectToMatchColor(
                Color.interpolate(color, targetColor, 0.5, 'oklch'),
                'rgb(52.64% 34.75% 56.72% / 0.6)',
                4
            );
            expect(
                Color.interpolate(
                    Color.transparent,
                    Color.parse('oklch(0.7 0.1 30 / 0)'),
                    0.5,
                    'oklch'
                )
            ).toMatchObject({r: 0, g: 0, b: 0, a: 0});
        });

        test('should interpolate colors in "oklab" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => Color.interpolate(color, targetColor, t, 'oklab');
            expectToMatchColor(i11nFn(0.0), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 37.26% 92.67% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.5), 'rgb(0% 56.90% 82.18% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 76.69% 64.76% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.0), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should premultiply lightness, a and b by alpha in "oklab" color space', () => {
            const color = Color.parse('oklab(0.7 0.1 0.05 / 0.2)');
            const targetColor = Color.parse('oklab(0.5 -0.05 -0.1)');

            expectToMatchColor(
                Color.interpolate(color, targetColor, 0.5, 'oklab'),
                'rgb(28.80% 43.77% 60.14% / 0.6)',
                4
            );
            expect(
                Color.interpolate(
                    Color.transparent,
                    Color.parse('oklab(0.7 0.1 0.05 / 0)'),
                    0.5,
                    'oklab'
                )
            ).toMatchObject({r: 0, g: 0, b: 0, a: 0});
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

        test('should interpolate colors outside sRGB without clipping them', () => {
            const green = Color.parse('color(display-p3 0 1 0)');
            const gray = Color.parse('color(display-p3 0.5 0.5 0.5)');

            expectCloseToArray(
                Color.interpolate(green, gray, 0.5, 'rgb').displayP3,
                [0.340546, 0.747752, 0.240746, 1]
            );
            expectCloseToArray(
                Color.interpolate(green, gray, 0.5, 'hcl').displayP3,
                [0.426789, 0.752735, 0.334541, 1]
            );
            expectCloseToArray(
                Color.interpolate(green, gray, 0.5, 'lab').displayP3,
                [0.426789, 0.752735, 0.334541, 1]
            );
            expectCloseToArray(
                Color.interpolate(green, gray, 0.5, 'oklch').displayP3,
                [0.420769, 0.75342, 0.392469, 1]
            );
            expectCloseToArray(
                Color.interpolate(green, gray, 0.5, 'oklab').displayP3,
                [0.420769, 0.75342, 0.392469, 1]
            );
        });

        test('should keep a lightness below zero when interpolating in LAB', () => {
            const darkerThanBlack = Color.parse('color(display-p3 -0.1 -0.1 -0.1)');
            const darkGray = Color.parse('color(display-p3 0.1 0.1 0.1)');

            expectCloseToArray(
                Color.interpolate(darkerThanBlack, darkGray, 0.5, 'lab').displayP3,
                [0, 0, 0, 1]
            );
        });

        test('should keep a lightness below zero when interpolating in HCL', () => {
            const darkerThanBlack = Color.parse('color(display-p3 -0.1 -0.1 -0.1)');
            const darkGray = Color.parse('color(display-p3 0.1 0.1 0.1)');

            expectCloseToArray(
                Color.interpolate(darkerThanBlack, darkGray, 0.5, 'hcl').displayP3,
                [0, 0, 0, 1]
            );
        });

        test('should limit interpolation results to sRGB gamut', () => {
            const color = Color.parse('royalblue');
            const targetColor = Color.parse('cyan');

            for (const space of ['rgb', 'hcl', 'lab', 'oklch'] as const) {
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

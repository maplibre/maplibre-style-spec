import Color from './color';

describe('Color class', () => {

    describe('parsing', () => {

        test('should parse color keyword', () => {
            expect(Color.parse('white')).toMatchColor('rgb(100% 100% 100% / 1)');
            expect(Color.parse('black')).toMatchColor('rgb(0% 0% 0% / 1)');
            expect(Color.parse('RED')).toMatchColor('rgb(100% 0% 0% / 1)');
            expect(Color.parse('aquamarine')).toMatchColor('rgb(49.804% 100% 83.137% / 1)');
            expect(Color.parse('steelblue')).toMatchColor('rgb(27.451% 50.98% 70.588% / 1)');
        });

        test('should parse hex color notation', () => {
            expect(Color.parse('#fff')).toMatchColor('rgb(100% 100% 100% / 1)');
            expect(Color.parse('#000')).toMatchColor('rgb(0% 0% 0% / 1)');
            expect(Color.parse('#f00C')).toMatchColor('rgb(100% 0% 0% / .8)');
            expect(Color.parse('#ff00ff')).toMatchColor('rgb(100% 0% 100% / 1)');
            expect(Color.parse('#4682B466')).toMatchColor('rgb(27.451% 50.98% 70.588% / .4)');
        });

        test('should parse rgb function syntax', () => {
            expect(Color.parse('rgb(0,0,128)')).toMatchColor('rgb(0% 0% 50.196% / 1)');
            expect(Color.parse('rgb(0 0 128)')).toMatchColor('rgb(0% 0% 50.196% / 1)');
            expect(Color.parse('rgb(0 0 128 / 0.2)')).toMatchColor('rgb(0% 0% 50.196% / .2)');
            expect(Color.parse('rgb(0 0 128 / .2)')).toMatchColor('rgb(0% 0% 50.196% / .2)');
            expect(Color.parse('rgb(0 0 128 / 20%)')).toMatchColor('rgb(0% 0% 50.196% / .2)');
            expect(Color.parse('rgba(26,207,26,.73)')).toMatchColor('rgb(10.196% 81.176% 10.196% / 0.73)');
            expect(Color.parse('rgba(0,0,128,1)')).toMatchColor('rgb(0% 0% 50.196% / 1)');
        });

        test('should parse hsl function syntax', () => {
            expect(Color.parse('hsl(300,100%,25.1%)')).toMatchColor('rgb(50.2% 0% 50.2% / 1)');
            expect(Color.parse('hsl(300 100% 25.1%)')).toMatchColor('rgb(50.2% 0% 50.2% / 1)');
            expect(Color.parse('hsl(300 100% 25.1% / 0.2)')).toMatchColor('rgb(50.2% 0% 50.2% / .2)');
            expect(Color.parse('hsl(300 100% 25.1% / .2)')).toMatchColor('rgb(50.2% 0% 50.2% / .2)');
            expect(Color.parse('hsl(300 100% 25.1% / 20%)')).toMatchColor('rgb(50.2% 0% 50.2% / .2)');
            expect(Color.parse('hsla(300,100%,25.1%,0.9)')).toMatchColor('rgb(50.2% 0% 50.2% / .9)');
            expect(Color.parse('hsla(300,100%,25.1%,.1)')).toMatchColor('rgb(50.2% 0% 50.2% / .1)');
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

        test('should keep a reference to the original color when alpha=0', () => {
            const color = Color.parse('rgba(0,0,128,0)');
            expect(color).toMatchObject({r: 0, g: 0, b: 0, a: 0});
            expect(Object.hasOwn(color, 'sRGB')).toBe(true);
            expect(color['sRGB']).toMatchObject({
                space: {name: 'sRGB'},
                coords: [0, 0, expect.closeTo(128 / 255, 5)],
                alpha: expect.closeTo(0, 5),
            });
        });

        test('should not keep a reference to the original color when alpha!=0', () => {
            const color = Color.parse('rgba(0,0,128,0.001)');
            expect(color).toMatchObject({r: 0, g: 0, b: expect.closeTo(128 / 255 * 0.001, 5), a: 0.001});
            expect(Object.hasOwn(color, 'sRGB')).toBe(false);
        });

    });

    describe('interpolation', () => {

        test('should interpolate colors in \'rgb\' color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = color.getInterpolationFn(targetColor, 'rgb');
            expect(i11nFn(0)).toMatchColor('rgb(0% 0% 100% / 1)');
            expect(i11nFn(0.25)).toMatchColor('rgb(0% 25% 75% / 0.9)');
            expect(i11nFn(0.5)).toMatchColor('rgb(0% 50% 50% / 0.8)');
            expect(i11nFn(0.75)).toMatchColor('rgb(0% 75% 25% / 0.7)');
            expect(i11nFn(1)).toMatchColor('rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in \'hcl\' color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = color.getInterpolationFn(targetColor, 'hcl');
            expect(i11nFn(0)).toMatchColor('rgb(0% 0% 100% / 1)', 4);
            expect(i11nFn(0.25)).toMatchColor('rgb(0% 43.66% 71.79% / 0.9)', 4);
            expect(i11nFn(0.5)).toMatchColor('rgb(0% 61.98% 72.63% / 0.8)', 4);
            expect(i11nFn(0.75)).toMatchColor('rgb(0% 80.83% 66.89% / 0.7)', 4);
            expect(i11nFn(1)).toMatchColor('rgb(0% 100% 0% / 0.6)', 4);
        });

        test('should interpolate colors in \'lab\' color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = color.getInterpolationFn(targetColor, 'lab');
            expect(i11nFn(0)).toMatchColor('rgb(0% 0% 100% / 1)', 4);
            expect(i11nFn(0.25)).toMatchColor('rgb(39.64% 34.55% 83.35% / 0.9)', 4);
            expect(i11nFn(0.5)).toMatchColor('rgb(46.42% 56.82% 65.91% / 0.8)', 4);
            expect(i11nFn(0.75)).toMatchColor('rgb(41.45% 78.34% 45.62% / 0.7)', 4);
            expect(i11nFn(1)).toMatchColor('rgb(0% 100% 0% / 0.6)', 4);
        });

        test('should limit interpolation results to sRGB gamut', () => {
            const color = Color.parse('royalblue');
            const targetColor = Color.parse('cyan');

            const i11nFn = color.getInterpolationFn(targetColor, 'hcl');
            const colorInBetween = i11nFn(0.5);
            for (const key of ['r', 'g', 'b', 'a']) {
                expect(colorInBetween[ key ]).toBeGreaterThanOrEqual(0);
                expect(colorInBetween[ key ]).toBeLessThanOrEqual(1);
            }
        });

        test('should used cached interpolation function', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');
            expect(color[ 'interpolationCache' ]).toBeUndefined();

            const i11nFn1 = color.getInterpolationFn(targetColor, 'rgb'); // first call
            expect(color[ 'interpolationCache' ]).toEqual({
                'rgb': expect.any(WeakMap), // cache for 'rgb' space was initialized
            });

            const i11nFn2 = color.getInterpolationFn(targetColor, 'rgb'); // second call
            expect(i11nFn2).toBe(i11nFn1); // exactly the same fn instance

            const i11nFn3 = color.getInterpolationFn(targetColor, 'hcl'); // third call, different space
            expect(color[ 'interpolationCache' ]).toEqual({
                'rgb': expect.any(WeakMap),
                'hcl': expect.any(WeakMap), // cache for 'hcl' space was initialized
            });
            expect(i11nFn3).not.toBe(i11nFn2); // different space, different fn instance
        });

    });

    describe('interpolation color space', () => {

        test('should recognize supported interpolation color spaces', () => {
            expect(Color.isSupportedColorSpace('rgb')).toBe(true);
            expect(Color.isSupportedColorSpace('hcl')).toBe(true);
            expect(Color.isSupportedColorSpace('lab')).toBe(true);
        });

        test('should ignore invalid interpolation color spaces', () => {
            expect(Color.isSupportedColorSpace('sRGB')).toBe(false);
            expect(Color.isSupportedColorSpace('HCL')).toBe(false);
            expect(Color.isSupportedColorSpace('LCH')).toBe(false);
            expect(Color.isSupportedColorSpace('LAB')).toBe(false);
            expect(Color.isSupportedColorSpace('interpolate')).toBe(false);
            expect(Color.isSupportedColorSpace('interpolate-hcl')).toBe(false);
            expect(Color.isSupportedColorSpace('interpolate-lab')).toBe(false);
        });

    });

});

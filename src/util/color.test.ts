import {expectCloseToArray, expectToMatchColor} from '../../test/unit/test_utils';
import Color from './color';

describe('Color class', () => {

    describe('parsing', () => {

        test('should parse color keyword', () => {
            expectToMatchColor(Color.parse('white'), 'rgb(100% 100% 100% / 1)');
            expectToMatchColor(Color.parse('black'), 'rgb(0% 0% 0% / 1)');
            expectToMatchColor(Color.parse('RED'), 'rgb(100% 0% 0% / 1)');
            expectToMatchColor(Color.parse('aquamarine'), 'rgb(49.804% 100% 83.137% / 1)');
            expectToMatchColor(Color.parse('steelblue'), 'rgb(27.451% 50.98% 70.588% / 1)');
        });

        test('should parse hex color notation', () => {
            expectToMatchColor(Color.parse('#fff'), 'rgb(100% 100% 100% / 1)');
            expectToMatchColor(Color.parse('#000'), 'rgb(0% 0% 0% / 1)');
            expectToMatchColor(Color.parse('#f00C'), 'rgb(100% 0% 0% / .8)');
            expectToMatchColor(Color.parse('#ff00ff'), 'rgb(100% 0% 100% / 1)');
            expectToMatchColor(Color.parse('#4682B466'), 'rgb(27.451% 50.98% 70.588% / .4)');
        });

        test('should parse rgb function syntax', () => {
            expectToMatchColor(Color.parse('rgb(0,0,128)'), 'rgb(0% 0% 50.196% / 1)');
            expectToMatchColor(Color.parse('rgb(0 0 128)'), 'rgb(0% 0% 50.196% / 1)');
            expectToMatchColor(Color.parse('rgb(0 0 128 / 0.2)'), 'rgb(0% 0% 50.196% / .2)');
            expectToMatchColor(Color.parse('rgb(0 0 128 / .2)'), 'rgb(0% 0% 50.196% / .2)');
            expectToMatchColor(Color.parse('rgb(0 0 128 / 20%)'), 'rgb(0% 0% 50.196% / .2)');
            expectToMatchColor(Color.parse('rgb(26,207,26,0.5)'), 'rgb(10.196% 81.176% 10.196% / .5)');
            expectToMatchColor(Color.parse('rgba(26,207,26,.73)'), 'rgb(10.196% 81.176% 10.196% / .73)');
            expectToMatchColor(Color.parse('rgba(0,0,128,.2)'), 'rgb(0% 0% 50.196% / .2)');
        });

        test('should parse hsl function syntax', () => {
            expectToMatchColor(Color.parse('hsl(300,100%,25.1%)'), 'rgb(50.2% 0% 50.2% / 1)');
            expectToMatchColor(Color.parse('hsl(300 100% 25.1%)'), 'rgb(50.2% 0% 50.2% / 1)');
            expectToMatchColor(Color.parse('hsl(300 100% 25.1% / 0.2)'), 'rgb(50.2% 0% 50.2% / .2)');
            expectToMatchColor(Color.parse('hsl(300 100% 25.1% / .2)'), 'rgb(50.2% 0% 50.2% / .2)');
            // expectToMatchColor(Color.parse('hsl(300 100% 25.1% / 20%)'), 'rgb(50.2% 0% 50.2% / .2)');
            expectToMatchColor(Color.parse('hsl(300,100%,25.1%,0.7)'), 'rgb(50.2% 0% 50.2% / .7)');
            expectToMatchColor(Color.parse('hsl(300deg 100% 25.1% / 0.7)'), 'rgb(50.2% 0% 50.2% / .7)');
            expectToMatchColor(Color.parse('hsla(300,100%,25.1%,0.9)'), 'rgb(50.2% 0% 50.2% / .9)');
            expectToMatchColor(Color.parse('hsla(300,100%,25.1%,.0)'), 'rgb(0% 0% 0% / 0)');
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

});

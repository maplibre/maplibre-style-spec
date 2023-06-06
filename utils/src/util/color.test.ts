import {expectCloseToArray, expectToMatchColor} from '../../test/unit/test_utils';
import Color from './color';

describe('Color class', () => {

    describe('parsing', () => {

        test('should parse valid css color strings', () => {
            expectToMatchColor(Color.parse('RED'), 'rgb(100% 0% 0% / 1)');
            expectToMatchColor(Color.parse('#f00C'), 'rgb(100% 0% 0% / .8)');
            expectToMatchColor(Color.parse('rgb(0 0 127.5 / 20%)'), 'rgb(0% 0% 50% / .2)');
            expectToMatchColor(Color.parse('hsl(300deg 100% 25.1% / 0.7)'), 'rgb(50.2% 0% 50.2% / .7)');
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

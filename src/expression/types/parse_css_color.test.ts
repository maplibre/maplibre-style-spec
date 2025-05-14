import {parseCssColor} from './parse_css_color';
import * as colorSpacesModule from './color_spaces';
import {RGBColor} from './color_spaces';
import {describe, test, expect, afterEach, vi} from 'vitest';
describe('parseCssColor', () => {

    // by changing the parse function, we can verify external css color parsers against our requirements
    const parse: (colorToParse: string) => RGBColor | undefined = parseCssColor;

    describe('color keywords', () => {

        test('should parse valid color names', () => {
            expect(parse('white')).toEqual([1, 1, 1, 1]);
            expect(parse('black')).toEqual([0, 0, 0, 1]);
            expect(parse('RED')).toEqual([1, 0, 0, 1]);
            expect(parse('AquaMarine')).toEqual([127 / 255, 255 / 255, 212 / 255, 1]);
            expect(parse('steelblue')).toEqual([70 / 255, 130 / 255, 180 / 255, 1]);
            expect(parse('rebeccapurple')).toEqual([0.4, 0.2, 0.6, 1]);
        });

        test('should parse "transparent" keyword as transparent black', () => {
            expect(parse('transparent')).toEqual([0, 0, 0, 0]);
            expect(parse('Transparent')).toEqual([0, 0, 0, 0]);
            expect(parse('TRANSPARENT')).toEqual([0, 0, 0, 0]);
        });

        test('should return undefined when provided with invalid color name', () => {
            expect(parse('not a color name')).toBeUndefined();
            expect(parse('')).toBeUndefined();
            expect(parse('blak')).toBeUndefined();
            expect(parse('aqua-marine')).toBeUndefined();
            expect(parse('aqua_marine')).toBeUndefined();
            expect(parse('aqua marine')).toBeUndefined();
            expect(parse('__proto__')).toBeUndefined();
            expect(parse('valueOf')).toBeUndefined();
        });

    });

    describe('RGB hexadecimal notations', () => {

        test('should parse valid rgb hex values', () => {
            // hex 3
            expect(parse('#fff')).toEqual([1, 1, 1, 1]);
            expect(parse('#000')).toEqual([0, 0, 0, 1]);
            expect(parse('#369')).toEqual([0.2, 0.4, 0.6, 1]);

            // hex 4
            expect(parse('#ffff')).toEqual([1, 1, 1, 1]);
            expect(parse('#fff0')).toEqual([1, 1, 1, 0]);
            expect(parse('#0000')).toEqual([0, 0, 0, 0]);
            expect(parse('#FFFC')).toEqual([1, 1, 1, 0.8]);
            expect(parse('#234a')).toEqual([34 / 255, 51 / 255, 68 / 255, 2 / 3]);

            // hex 6
            expect(parse('#ffffff')).toEqual([1, 1, 1, 1]);
            expect(parse('#000000')).toEqual([0, 0, 0, 1]);
            expect(parse('#008000')).toEqual([0, 128 / 255, 0, 1]);
            expect(parse('#b96710')).toEqual([185 / 255, 103 / 255, 16 / 255, 1]);

            // hex 8
            expect(parse('#ffffffff')).toEqual([1, 1, 1, 1]);
            expect(parse('#000000ff')).toEqual([0, 0, 0, 1]);
            expect(parse('#00000000')).toEqual([0, 0, 0, 0]);
            expect(parse('#FFCc9933')).toEqual([255 / 255, 204 / 255, 153 / 255, 0.2]);
            expect(parse('#4682B466')).toEqual([70 / 255, 130 / 255, 180 / 255, 0.4]);
        });

        test('should return undefined when provided with invalid rgb hex value', () => {
            expect(parse('#')).toBeUndefined();
            expect(parse('#f')).toBeUndefined();
            expect(parse('#ff')).toBeUndefined();
            expect(parse('#ffg')).toBeUndefined();
            expect(parse('#fffg')).toBeUndefined();
            expect(parse('#fffff')).toBeUndefined();
            expect(parse('#fffffg')).toBeUndefined();
            expect(parse('#fffffff')).toBeUndefined();
            expect(parse('#fffffffg')).toBeUndefined();
            expect(parse('#fffffffff')).toBeUndefined();
            expect(parse('fff')).toBeUndefined();
            expect(parse('# fff')).toBeUndefined();
        });

    });

    describe('RGB functions "rgb()" and "rgba()"', () => {

        test('should parse valid rgb values', () => {
            // rgb 0..255
            expect(parse('rgb(0 51 0)')).toEqual([0, 0.2, 0, 1]);
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(0, 51, 0)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(0.0, 51.0, +0.0)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgba(0, 51, 0)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgba(0, 51, 0, 1)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgba(0, 51, 0, 100%)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgba( 0, 51, 0, 100% )'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgba( 00 ,51 ,0 ,100% )'));
            expect(parse('rgb(0 51 0)')).toEqual(parse(' rgb(.0 51 0 / 1)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(0.0 51.0 0.0 / 1.0) '));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(0 51 0 / 1.0)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('RGB(0 51 0 / 100%)'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(  0  51  0/1  )'));
            expect(parse('rgb(0 51 0)')).toEqual(parse('rgb(0 5.1e+1 0 / .1e1)'));
            expect(parse('rgb(0,0.5,1)')).toEqual([0, 0.5 / 255, 1 / 255, 1]);
            expect(parse('rgb(0,0.5,1)')).toEqual(parse('rgb(0 0.5 1)'));
            expect(parse('rgb(0,0,0,.1e-4)')).toEqual([0, 0, 0, 1e-5]);
            expect(parse('rgb(102,51,153)')).toEqual([0.4, 0.2, 0.6, 1]);
            expect(parse('rgb(26,207,26,0.5)')).toEqual([26 / 255, 207 / 255, 26 / 255, 0.5]);
            expect(parse('rgba(26,207,26,.73)')).toEqual([26 / 255, 207 / 255, 26 / 255, 0.73]);
            expect(parse('rgb(127.5 0 0)')).toEqual([0.5, 0, 0, 1]);
            expect(parse('rgb(128 0 0)')).toEqual([128 / 255, 0, 0, 1]);
            expect(parse('rgb(100 200 300)')).toEqual([100 / 255, 200 / 255, 1, 1]);
            expect(parse('rgb(-0 255 153)')).toEqual([0, 1, 0.6, 1]);
            expect(parse('rgb(-100 300 153)')).toEqual([0, 1, 0.6, 1]);
            expect(parse('rgb(-51, 306, 0)')).toEqual([0, 1, 0, 1]);
            expect(parse('rgba(0,0,0,0.1)')).toEqual([0, 0, 0, 0.1]);
            expect(parse('rgba(0,0,0,0.1)')).toEqual(parse('rgb(0 0 0 / .1)'));
            expect(parse('rgba(0,0,0,0.1)')).toEqual(parse('rgb(0 0 0 / 10%)'));
            expect(parse('rgb(0 0 0 / .0)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0 0 0 / -.0)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0 0 0 / -3.4e-2)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0 0 0 / -.2)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0 0 0 / -10%)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0 0 0 / 1.0)')).toEqual([0, 0, 0, 1]);
            expect(parse('rgb(0 0 0 / 1.1)')).toEqual([0, 0, 0, 1]);
            expect(parse('rgb(0 0 0 / 110%)')).toEqual([0, 0, 0, 1]);

            // rgb 0%..100%
            expect(parse('rgb(0% 50% 0%)')).toEqual([0, 0.5, 0, 1]);
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb(0%, 50%, 0%)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgba(0%, 50%, 0%, 1)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgba(0%, 50%, 0%, 100%)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgba(-0e1%,5E1%,0%,1)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb(0% 50% 0% / 1.0)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb(.0% 50% 0% / 100%)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb(0.0% 50.0% 0.0% / 1)'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb( 0% 50% 0% /  100% )'));
            expect(parse('rgb(0% 50% 0%)')).toEqual(parse('rgb(-1e-9% 50% 0% /1)'));
            expect(parse('rgb(-0% 100% 60%)')).toEqual([0, 1, 0.6, 1]);
            expect(parse('rgb(-10% 200% 60%)')).toEqual([0, 1, 0.6, 1]);
            expect(parse('rgb(100%,200%,300%)')).toEqual([1, 1, 1, 1]);
            expect(parse('rgb(128% 51% 255%)')).toEqual([1, 0.51, 1, 1]);
            expect(parse('rgba(0%,0%,0%,0.1)')).toEqual([0, 0, 0, 0.1]);
            expect(parse('rgba(0%,0%,0%,0.1)')).toEqual(parse('rgb(0% 0% 0% / .1)'));
            expect(parse('rgba(0%,0%,0%,0.1)')).toEqual(parse('rgb(0% 0% 0% / 10%)'));
            expect(parse('rgb(0% 0% 0% / .0)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0% 0% 0% / -.0)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0% 0% 0% / -3.4e-2)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0% 0% 0% / -.2)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0% 0% 0% / -10%)')).toEqual([0, 0, 0, 0]);
            expect(parse('rgb(0% 0% 0% / 1.0)')).toEqual([0, 0, 0, 1]);
            expect(parse('rgb(0% 0% 0% / 1.1)')).toEqual([0, 0, 0, 1]);
            expect(parse('rgb(0% 0% 0% / 110%)')).toEqual([0, 0, 0, 1]);
        });

        test('should return undefined when provided with invalid rgb value', () => {
            expect(parse('rgb (0,0,0)')).toBeUndefined();
            expect(parse('rgba (0,0,0,0)')).toBeUndefined();

            const invalidArgs = [
                '10%, 50%, 0', // values must be all numbers or all percentages
                '255, 50%, 0%',
                '10%, 50%, 0, 1',
                '255, 50%, 0%, 1',
                '0 50% 255 / 1',
                '0 50% 0 / 1',
                '128 51% 255',
                '0, 0 0', // comma optional syntax requires no commas at all
                '0, 0, 0 0',
                '0, 0, 0 / 1',
                '0 0 0, 1',
                '0, 0, 0deg', // angles are not accepted in the rgb function
                '0, 0, 0, 0deg',
                '0, 0, light', // keywords are not accepted in the rgb function
                '0, 0, 0, light',
                '--1,0,0', // invalid numbers
                '+-1,0,0',
                '++1,0,0',
                '1.1.1,0,0',
                '.-1,0,0',
                '..1,0,0',
                '1e1.1,0,0',
                '1e.1,0,0',
                '--1e1,0,0',
                '+-1e1,0,0',
                '', // the rgb function requires 3 or 4 arguments
                '0',
                ', 0,',
                '0, 0',
                '0, 0,',
                ', 0, 0',
                '0 0 0 /',
                '0, 0, 0, 0, 0',
                '0, 0, 0, 0, 0,',
                ', 0, 0, 0, 0, 0',
                '0%',
                ', 0%,',
                '0%, 0%',
                '0%, 0%,',
                ', 0%, 0%',
                '0%, 0%, 0%,',
                '0% 0% 0% /',
                '0%, 0%, 0%, 0%, 0%',
                '0%, 50%, 100%,',
                ', 0%, 50%, 100%',
                ', 0%, 50%, 100%, 100%',
                '0%, 50%, 100%, 100%,',
            ];

            for (const args of invalidArgs) {
                for (const fn of ['rgb', 'rgba']) {
                    const input = `${fn}(${args})`;
                    try {
                        expect(parse(input)).toBeUndefined();
                    } catch (error) {
                        error.message = `\nInput: ${input}\n${error.message}`;
                        throw error;
                    }
                }
            }
        });

    });

    describe('HSL functions "hsl()" and "hsla()"', () => {

        afterEach(() => {
            vi.resetAllMocks();
        });

        test('should parse valid hsl values', () => {
            vi.spyOn(colorSpacesModule, 'hslToRgb').mockImplementation((hslColor) => hslColor);

            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual([300, 100, 25.1, 1]);
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsla(300,100%,25.1%,1)'));
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsla(300,100%,25.1%,100%)'));
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300 100% 25.1%)'));
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300 100% 25.1%/1.0)'));
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300.0 100% 25.1% / 100%)'));
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(parseCssColor('hsl(300deg 100% 25.1% / 100%)'));

            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual([240, 0, 55, 0.2]);
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsla(240.0,0%,55%,0.2)'));
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsla( 240 ,.0% ,55.0% ,20% )'));
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsl(240 0% 55% / 0.2)'));
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsl(240 0% 55% / 20%)'));
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsl(24e1deg 0e1% 55% / 2e-1)'));
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(parseCssColor('hsla(240 -1e-7% 55% / 2e1%)'));

            expect(parseCssColor('hsl(240,0%,55%,0.9)')).toEqual([240, 0, 55, 0.9]);
            expect(parseCssColor('hsl(240,0%,55%,.0)')).toEqual([240, 0, 55, 0]);
            expect(parseCssColor('hsl(700 0% 67.3% / 100%)')).toEqual([700, 0, 67.3, 1]);
            expect(parseCssColor('Hsl( -100 -10.5% 67.3% / 100% )')).toEqual([-100, 0, 67.3, 1]);
        });

        test('should parse valid hsl values and convert to rgb', () => {
            expect(parse('hsl(0 100% 50%)')).toEqual([1, 0, 0, 1]);
            expect(parse('hsl(240 100% 50%)')).toEqual([0, 0, 1, 1]);
            expect(parse('hsl(240 100% 25%)')).toEqual([0, 0, 0.5, 1]);
            expect(parse('hsl(273 75% 60%)')).toEqual([expect.closeTo(0.63), expect.closeTo(0.3), 0.9, 1]);

            expect(parse('hsl(0 0% 0%)')).toEqual([0, 0, 0, 1]);
            expect(parse('hsl(0 0% 0% / 0)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / 0)')).toEqual(parse('hsl(0,0%,0%,+0)'));
            expect(parse('hsl(0 0% 0% / 0)')).toEqual(parse('hsla(0deg,0%,0%,-0)'));
            expect(parse('hsl(0 0% 0% / 0)')).toEqual(parse('hsla(0,0%,0%,0%)'));
            expect(parse('hsl(0 0% 0% / 0)')).toEqual(parse(' hsla(.0,.0%,.0%,.0%)'));
            expect(parse('hsl(0 0% 0% / 0)')).toEqual(parse('hsla(  0 ,0% ,0% ,.0 ) '));

            expect(parse('hsl(120 100% 25%)')).toEqual([0, 0.5, 0, 1]);
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120.0 100.0% 25.0%)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120deg 100% 25%)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120 100% 25% / 1.0)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120deg 100% 25% / 1)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120 100% 25% / 100%)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsl(120,100%,25%,100%)'));
            expect(parse('hsl(120 100% 25%)')).toEqual(parse('hsla(120deg,100%,25%,100%)'));

            expect(parse('hsl(120 100% 50% / .25)')).toEqual([0, 1, 0, 0.25]);
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('HSLA(120,100%,50%,.25)'));
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('hsla(120,100%,50%,25%)'));
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('hsl(120 100% 50%/.25)'));
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('hsl(120deg 100% 50% / 25%)'));
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('hsl(480 100% 50% / 25%)'));
            expect(parse('hsl(120 100% 50% / .25)')).toEqual(parse('hsl(-240deg 100% 50% / 25%)'));

            expect(parse('hsl(0.0 200% 50%)')).toEqual(parse('hsl(0 100% 50%)'));
            expect(parse('hsl(-0 -100% -100%)')).toEqual(parse('hsl(0 0% 0%)'));
            expect(parse('hsl(0 0% 0% / .0)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / -.0)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / -3.4e-2)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / -.2)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / -10%)')).toEqual([0, 0, 0, 0]);
            expect(parse('hsl(0 0% 0% / 1.0)')).toEqual([0, 0, 0, 1]);
            expect(parse('hsl(0 0% 0% / 1.1)')).toEqual([0, 0, 0, 1]);
            expect(parse('hsl(0 0% 0% / 110%)')).toEqual([0, 0, 0, 1]);
        });

        test('should return undefined when provided with invalid hsl value', () => {
            expect(parse('hsl (0,0%,0%)')).toBeUndefined();
            expect(parse('hsla (0,0%,0%,1)')).toBeUndefined();

            const invalidArgs = [
                '0,0%,0 %',
                '0%,0%,0%', // the first parameter of hsl/hsla must be a number or angle
                '0 deg,0%,0%',
                '10, 50%, 0', // the second and third parameters of hsl/hsla must be a percent
                '0, 0% 0%', // comma optional syntax requires no commas at all
                '0, 0% 0%, 1',
                '0,0%,light,1', // keywords are not accepted in the hsl function
                '--1,0%,0%', // invalid numbers
                '+-1,0%,0%',
                '++1,0%,0%',
                '1.1.1,0%,0%',
                '.-1,0%,0%',
                '..1,0%,0%',
                '1e1.1,0%,0%',
                '1e.1,0%,0%',
                '--1e1,0%,0%',
                '+-1e1,0%,0%',
                '', // The hsl function requires 3 or 4 arguments
                '0',
                '0 0%',
                '0, 0%,',
                ', 0%, 0%',
                '0,0%,0%,1,0%',
                '0,0,0',
                '0,0%,0',
                '0,0,0%',
                '0 0% 0% /',
                '0,0%,0%,',
                ', 0%,0%,0%',
            ];

            for (const args of invalidArgs) {
                for (const fn of ['hsl', 'hsla']) {
                    const input = `${fn}(${args})`;
                    try {
                        expect(parse(input)).toBeUndefined();
                    } catch (error) {
                        error.message = `\nInput: ${input}\n${error.message}`;
                        throw error;
                    }
                }
            }
        });

    });

});

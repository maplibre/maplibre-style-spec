import {parseCssColor} from './parse_css_color';
import * as colorSpacesModule from './color_spaces';
import {RGBColor} from './color_spaces';
import {expectCloseToArray} from '../../../test/lib/util';
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
                '0%, 50%, 100%, 100%,'
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
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsla(300,100%,25.1%,1)')
            );
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsla(300,100%,25.1%,100%)')
            );
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsl(300 100% 25.1%)')
            );
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsl(300 100% 25.1%/1.0)')
            );
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsl(300.0 100% 25.1% / 100%)')
            );
            expect(parseCssColor('hsl(300,100%,25.1%)')).toEqual(
                parseCssColor('hsl(300deg 100% 25.1% / 100%)')
            );

            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual([240, 0, 55, 0.2]);
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsla(240.0,0%,55%,0.2)')
            );
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsla( 240 ,.0% ,55.0% ,20% )')
            );
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsl(240 0% 55% / 0.2)')
            );
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsl(240 0% 55% / 20%)')
            );
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsl(24e1deg 0e1% 55% / 2e-1)')
            );
            expect(parseCssColor('hsl(240,0%,55%,0.2)')).toEqual(
                parseCssColor('hsla(240 -1e-7% 55% / 2e1%)')
            );

            expect(parseCssColor('hsl(240,0%,55%,0.9)')).toEqual([240, 0, 55, 0.9]);
            expect(parseCssColor('hsl(240,0%,55%,.0)')).toEqual([240, 0, 55, 0]);
            expect(parseCssColor('hsl(700 0% 67.3% / 100%)')).toEqual([700, 0, 67.3, 1]);
            expect(parseCssColor('Hsl( -100 -10.5% 67.3% / 100% )')).toEqual([-100, 0, 67.3, 1]);
        });

        test('should parse valid hsl values and convert to rgb', () => {
            expect(parse('hsl(0 100% 50%)')).toEqual([1, 0, 0, 1]);
            expect(parse('hsl(240 100% 50%)')).toEqual([0, 0, 1, 1]);
            expect(parse('hsl(240 100% 25%)')).toEqual([0, 0, 0.5, 1]);
            expect(parse('hsl(273 75% 60%)')).toEqual([
                expect.closeTo(0.63),
                expect.closeTo(0.3),
                0.9,
                1
            ]);

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
                ', 0%,0%,0%'
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

    describe('OKLCH function "oklch()"', () => {
        test('should parse valid oklch values and convert to rgb', () => {
            expectCloseToArray(parse('oklch(70% 0.1 30)'), [0.836736, 0.526627, 0.475198, 1]);
            expectCloseToArray(
                parse('oklch(0.8 0.05 160 / 0.75)'),
                [0.638114, 0.784944, 0.701091, 0.75]
            );

            const yellowish = [0.593719, 0.490828, 0.190116, 1];
            for (const input of [
                'oklch(0.6 0.1 90)',
                'oklch(60% 25% 90deg)',
                'oklch(0.6 0.1 100grad)',
                'oklch(0.6 0.1 1.5707963267948966rad)',
                'oklch(0.6 0.1 0.25turn)',
                'oklch(0.6 0.1 450)',
                'oklch(0.6 0.1 -270deg)',
                'OKLCH(60% 0.1 90DEG)',
                'oklch(6e-1 1E-1 +9e1)',
                'oklch(+.6 .1 90 / 1)',
                ' oklch(  0.6\t0.1\n90  /  100% ) '
            ]) {
                expectCloseToArray(parse(input), yellowish);
            }
        });

        test('should wrap a huge angle before converting it to degrees', () => {
            expect(parse('oklch(0.6 0.1 1e306turn)')).toEqual(parse('oklch(0.6 0.1 0)'));
            expect(parse('oklch(0.6 0.1 1e307rad)')).toBeDefined();
        });

        test('should clamp lightness, chroma and alpha', () => {
            expect(parse('oklch(1.2 0.1 30)')).toEqual(parse('oklch(1 0.1 30)'));
            expect(parse('oklch(120% 0.1 30)')).toEqual(parse('oklch(1 0.1 30)'));
            expect(parse('oklch(-0.1 0.1 30)')).toEqual(parse('oklch(0 0.1 30)'));
            expect(parse('oklch(0.6 -0.1 30)')).toEqual(parse('oklch(0.6 0 30)'));
            expect(parse('oklch(0.6 0.1 30 / 1.5)')).toEqual(parse('oklch(0.6 0.1 30)'));
            expect(parse('oklch(0.6 0.1 30 / -1)')[3]).toBe(0);
            expect(parse('oklch(0.6 0.1 30 / 50%)')[3]).toBe(0.5);
        });

        test('should read none as zero', () => {
            expect(parse('oklch(none 0.1 90)')).toEqual(parse('oklch(0 0.1 90)'));
            expectCloseToArray(parse('oklch(0.6 none 90)'), [0.502111, 0.502111, 0.502111, 1]);
            expectCloseToArray(parse('oklch(0.6 0.1 none)'), [0.692324, 0.39884, 0.492791, 1]);
            expect(parse('oklch(0.6 0.1 90 / none)')[3]).toBe(0);
        });

        test('should clip colors outside sRGB', () => {
            expectCloseToArray(parse('oklch(0.7 0.3 140)'), [0, 0.771585, 0, 1]);
            expectCloseToArray(parse('oklch(0.9 0.3 300)'), [1, 0.625509, 1, 1]);
            expect(parse('oklch(0.6 1e110 90)')).toEqual([0, 1, 0, 1]);
        });

        test('should return undefined when provided with invalid oklch value', () => {
            expect(parse('oklch (0.6 0.1 90)')).toBeUndefined();
            expect(parse('oklch(0.6 0.1 90')).toBeUndefined();
            expect(parse('oklch(0.6 0.1 90))')).toBeUndefined();

            const invalidArgs = [
                '0.6, 0.1, 90', // commas are not allowed
                '0.6 0.1 90, 0.5',
                '', // oklch requires 3 arguments and an optional alpha after a slash
                '0.6 0.1',
                '0.6 0.1 90 0.5',
                '0.6 0.1 90 /',
                '0.6 0.1 90 / 0.5 / 0.5',
                '0.6 0.1 90%', // the hue is a number or an angle
                '0.6 0.1 90 deg',
                '0.6 0.1 90grads',
                '0.6 0.1 nonedeg',
                '0.6deg 0.1 90', // lightness and chroma are numbers or percentages
                '0.6 0.1deg 90',
                '1. 0.1 90', // invalid numbers
                '0.6 0.1 --90',
                '0.6 0.1 9e',
                '0.6 0.1 1e999'
            ];

            for (const args of invalidArgs) {
                const input = `oklch(${args})`;
                try {
                    expect(parse(input)).toBeUndefined();
                } catch (error) {
                    error.message = `\nInput: ${input}\n${error.message}`;
                    throw error;
                }
            }
        });
    });
});

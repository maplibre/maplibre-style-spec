import {validateColor} from './validate_color';
import {describe, test, expect} from 'vitest';

describe('validateColor function', () => {

    const key = 'sample_color_key';

    test('should return no errors when color is valid color string', () => {
        const validColorStrings = [
            'navajowhite',
            '#123',
            '#0F91',
            '#00fF00',
            '#0000ffcc',
            'rgb(0,0,0)',
            'rgba(28,148,103,0.5)',
            'rgb(28 148 103 / 50%)',
            'hsl(0 0% 0%)',
            'hsla(158,68.2%,34.5%,0.5)',
        ];

        for (const value of validColorStrings) {
            expect(validateColor({key, value})).toEqual([]);
        }
    });

    test('should return error when color is not a string', () => {
        expect(validateColor({key, value: 0})).toMatchObject([
            {message: `${key}: color expected, number found`},
        ]);
        expect(validateColor({key, value: [0, 0, 0]})).toMatchObject([
            {message: `${key}: color expected, array found`},
        ]);
        expect(validateColor({key, value: {}})).toMatchObject([
            {message: `${key}: color expected, object found`},
        ]);
        expect(validateColor({key, value: false})).toMatchObject([
            {message: `${key}: color expected, boolean found`},
        ]);
        expect(validateColor({key, value: null})).toMatchObject([
            {message: `${key}: color expected, null found`},
        ]);
        expect(validateColor({key, value: undefined})).toMatchObject([
            {message: `${key}: color expected, undefined found`},
        ]);
    });

    test('should return error when color is invalid color string', () => {
        const invalidColorStrings = [
            'navajo_white',
            '#123g',
            '0F91',
            'rgb(28 148 / 0.8)',
            'rgb(28 148 103 0.5)',
            'rgb(28 148 103 / 0.5 2)',
            'hsl(0,0,0)',
        ];

        for (const value of invalidColorStrings) {
            expect(validateColor({key, value})).toEqual([
                {message: `${key}: color expected, "${value}" found`},
            ]);
        }
    });

});

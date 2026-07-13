import {validate} from './validate';
import {validateColorArray} from './validate_color_array';
import {describe, test, expect} from 'vitest';

describe('Validate ColorArray', () => {
    test('Should return error if type is not color or array', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: 3});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, number found');

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, boolean found');

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, null found');

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: {x: 1, y: 1}
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, object found');

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: NaN});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, number found');
    });

    test('Should return error if it contains a value that does not parse to color', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: '3'});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray: color expected, "3" found');

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: ['3', 'words']
        });
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('colorArray[0]: color expected, "3" found');
        expect(errors[1].message).toBe('colorArray[1]: color expected, "words" found');

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: ['#012', 'words']
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('colorArray[1]: color expected, "words" found');
    });

    test('Should pass if type is color', () => {
        let errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: '#987654'
        });
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: 'red'});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: '#987654ff'
        });
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: '#987'});
        expect(errors).toHaveLength(0);
    });

    test('Should pass if type is array of colors', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: []});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe(
            'colorArray: array length at least 1 expected, length 0 found'
        );

        errors = validateColorArray({validateSpec: validate, key: 'colorArray', value: ['red']});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: ['red', 'blue']
        });
        expect(errors).toHaveLength(0);

        errors = validateColorArray({
            validateSpec: validate,
            key: 'colorArray',
            value: ['red', 'blue', '#012', '#12345678', '#012345']
        });
        expect(errors).toHaveLength(0);
    });
});

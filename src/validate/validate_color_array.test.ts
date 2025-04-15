import {validate} from './validate';
import {validateColorArray} from './validate_color_array';

describe('Validate ColorArray', () => {
    test('Should return error if type is not color or array', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'color-array', value: 3});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, number found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, boolean found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, null found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: {x: 1, y: 1}});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, object found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: NaN});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, number found');
    });

    test('Should return error if it contains a value that does not parse to color', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'color-array', value: '3'});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array: color expected, "3" found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: ['3', 'words']});
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('color-array[0]: color expected, "3" found');
        expect(errors[1].message).toBe('color-array[1]: color expected, "words" found');

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: ['#012', 'words']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('color-array[1]: color expected, "words" found');
    });

    test('Should pass if type is color', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'color-array', value: '#987654'});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: 'red'});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: '#987654ff'});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: '#987'});
        expect(errors).toHaveLength(0);
    });

    test('Should pass if type is array of colors', () => {
        let errors = validateColorArray({validateSpec: validate, key: 'color-array', value: []});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: ['red']});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: ['red', 'blue']});
        expect(errors).toHaveLength(0);

        errors = validateColorArray({validateSpec: validate, key: 'color-array', value: ['red', 'blue', '#012', '#12345678', '#012345']});
        expect(errors).toHaveLength(0);
    });
});

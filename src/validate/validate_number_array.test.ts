import {validate} from './validate';
import {validateNumberArray} from './validate_number_array';
import {describe, test, expect} from 'vitest';

describe('Validate NumberArray', () => {
    test('Should return error if type is not number or array', () => {
        let errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: '3'});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: number expected, string found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: number expected, boolean found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: number expected, null found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: {x: 1, y: 1}});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: number expected, object found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: NaN});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: number expected, NaN found');
    });

    test('Should pass if type is number', () => {
        const errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: 1});
        expect(errors).toHaveLength(0);
    });
    test('Should return error if array contains non-numeric values', () => {
        let errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: ['1']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray[0]: number expected, string found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [true]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray[0]: number expected, boolean found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [NaN]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray[0]: number expected, NaN found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [{x: 1}]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray[0]: number expected, object found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [1, 3, false]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray[2]: number expected, boolean found');

        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: ['1', 3, false]});
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('numberArray[0]: number expected, string found');
        expect(errors[1].message).toBe('numberArray[2]: number expected, boolean found');
    });

    test('Should pass if type is numeric array', () => {
        let errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: []});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('numberArray: array length at least 1 expected, length 0 found');
        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [1]});
        expect(errors).toHaveLength(0);
        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [1, 1, 1]});
        expect(errors).toHaveLength(0);
        errors = validateNumberArray({validateSpec: validate, key: 'numberArray', value: [1, 1, 1, 1, 1, 1, 1, 1]});
        expect(errors).toHaveLength(0);
    });
});

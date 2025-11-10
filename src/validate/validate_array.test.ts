import {validate} from './validate';
import {validateArray} from './validate_array';
import v8 from '../reference/v8.json' with {type: 'json'};
import {describe, test, expect} from 'vitest';

describe('Validate Array', () => {
    test('Should return error if type is not array', () => {
        let errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: '3',
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array expected, string found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: true,
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array expected, boolean found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: null,
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array expected, null found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: {x: 1, y: 1},
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array expected, object found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: 123,
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array expected, number found');
    });

    test('Should return error if array length does not match spec', () => {
        const errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, 2, 3],
            valueSpec: {type: 'array', value: 'number', length: 2},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray: array length 2 expected, length 3 found');
    });

    test('Should pass if array length matches spec', () => {
        const errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, 2],
            valueSpec: {type: 'array', value: 'number', length: 2},
            styleSpec: v8
        });
        expect(errors).toHaveLength(0);
    });

    test('Should return error if array contains invalid element types', () => {
        let errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: ['1', '2'],
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('testArray[0]: number expected, string found');
        expect(errors[1].message).toBe('testArray[1]: number expected, string found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, true, 3],
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray[1]: number expected, boolean found');

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, 2, null],
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('testArray[2]: number expected, null found');
    });

    test('Should pass if array contains valid element types', () => {
        let errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, 2, 3],
            valueSpec: {type: 'array', value: 'number'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(0);

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: ['a', 'b', 'c'],
            valueSpec: {type: 'array', value: 'string'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(0);

        errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [true, false, true],
            valueSpec: {type: 'array', value: 'boolean'},
            styleSpec: v8
        });
        expect(errors).toHaveLength(0);
    });

    test('Should validate arrays with complex element specs', () => {
        const errors = validateArray({
            validateSpec: validate,
            key: 'testArray',
            value: [1, 2, 3],
            valueSpec: {
                type: 'array',
                value: {
                    type: 'number'
                }
            },
            styleSpec: v8
        });
        expect(errors).toHaveLength(0);
    });
});

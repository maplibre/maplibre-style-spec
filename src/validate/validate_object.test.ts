import {validate} from './validate';
import {validateObject} from './validate_object';
import v8 from '../reference/v8.json' with {type: 'json'};

describe('Validate object', () => {
    test('Should not throw an unexpected error if object prototype keys are used as keys', () => {
        const errors = validateObject({
            key: 'test',
            value: {
                __defineProperty__: 123,
                hasOwnProperty: 123,
                toLocaleString: 123,
                valueOf: 123,
            },
            style: {},
            styleSpec: v8,
            validateSpec: validate,
        });
        expect(errors).toEqual([
            {message: 'test: unknown property "__defineProperty__"'},
            {message: 'test: unknown property "hasOwnProperty"'},
            {message: 'test: unknown property "toLocaleString"'},
            {message: 'test: unknown property "valueOf"'},
        ]);
    });

    test('Should not throw an unexpected error if object prototype keys are used as dot separated keys', () => {
        const errors = validateObject({
            key: 'test',
            value: {
                '__proto__.__proto__': 123,
                '__defineProperty__.__defineProperty__': 123,
                'hasOwnProperty.hasOwnProperty': 123,
                'toLocaleString.toLocaleString': 123,
                'valueOf.valueOf': 123,
            },
            style: {},
            styleSpec: v8,
            validateSpec: validate,
        });
        expect(errors).toEqual([
            {message: 'test: unknown property "__proto__.__proto__"'},
            {message: 'test: unknown property "__defineProperty__.__defineProperty__"'},
            {message: 'test: unknown property "hasOwnProperty.hasOwnProperty"'},
            {message: 'test: unknown property "toLocaleString.toLocaleString"'},
            {message: 'test: unknown property "valueOf.valueOf"'},
        ]);
    });
});

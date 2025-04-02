import {validateState} from './validate_state';

describe('Validate state', () => {
    test('Should return error if type is not an object', () => {
        let errors = validateState({key: 'state', value: 3});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, number found');

        errors = validateState({key: 'state', value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, boolean found');

        errors = validateState({key: 'state', value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, null found');
    });

    test('Should pass if type is object', () => {
        const errors = validateState({key: 'state', value: {}});
        expect(errors).toHaveLength(0);
    });

    describe('number', () => {
        test('should return no errors for correct definition', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: 3}}
            });
            expect(errors).toHaveLength(0);
        });
        test('should return error if default is not a number', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: '3'}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someNumber.default: number expected');
        });
        test('should return error if value is greater than maximum', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: 3, maximum: 2}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someNumber.default: must be less than or equal to 2');
        });
        test('should return error if value is less than minimum', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: 1, minimum: 2}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someNumber.default: must be greater than or equal to 2');
        });
        test('should return error if minimum is not a number', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: 1, minimum: '2'}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someNumber.minimum: must be a number');
        });
        test('should return error if maximum is not a number', () => {
            const errors = validateState({
                key: 'state',
                value: {someNumber: {type: 'number', default: 1, maximum: '2'}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someNumber.maximum: must be a number');
        });
    });

    describe('string', () => {
        test('should return no errors for correct definition', () => {
            const errors = validateState({
                key: 'state',
                value: {someString: {type: 'string', default: '3'}}
            });
            expect(errors).toHaveLength(0);
        });
        test('should return error if default is not a string', () => {
            const errors = validateState({
                key: 'state',
                value: {someString: {type: 'string', default: 3}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someString.default: string expected');
        });
    });
    describe('boolean', () => {
        test('should return no errors for correct definition', () => {
            const errors = validateState({
                key: 'state',
                value: {someBoolean: {type: 'boolean', default: true}}
            });
            expect(errors).toHaveLength(0);
        });
        test('should return error if default is not a boolean', () => {
            const errors = validateState({
                key: 'state',
                value: {someBoolean: {type: 'boolean', default: 3}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someBoolean.default: boolean expected');
        });
    });
    describe('enum', () => {
        test('should return no errors for correct definition', () => {
            const errors = validateState({
                key: 'state',
                value: {someEnum: {default: 'a', enum: ['a', 'b']}}
            });
            expect(errors).toHaveLength(0);
        });
        test('should return error if default is not in enum values', () => {
            const errors = validateState({
                key: 'state',
                value: {someEnum: {default: 'c', enum: ['a', 'b']}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someEnum.default: expected one of the enum values: a, b');
        });
    });
    describe('array', () => {
        test('should return no errors for correct definition', () => {
            const errors = validateState({
                key: 'state',
                value: {someArray: {type: 'array', items: {type: 'number'}, default: [1, 2, 3]}}
            });
            expect(errors).toHaveLength(0);
        });
        test('should return error if items are not defined', () => {
            const errors = validateState({
                key: 'state',
                value: {someArray: {type: 'array', default: [1, 2, 3]}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someArray.items: is required');
        });
        test('should return error if default is not an array', () => {
            const errors = validateState({
                key: 'state',
                value: {someArray: {type: 'array', items: {type: 'number'}, default: 3}}
            });
            expect(errors).toHaveLength(1);
            expect(errors[0].message).toBe('state.someArray.default: array expected');
        });
    });
});
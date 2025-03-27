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
});
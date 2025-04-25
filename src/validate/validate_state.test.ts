import {validateState} from './validate_state';

describe('Validate state', () => {
    test('Should return error if type is not an object', () => {
        const errors = validateState({key: 'state', value: 3});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, number found');
    });
});

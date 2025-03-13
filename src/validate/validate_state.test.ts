import {validateState} from './validate_state';
import {validate} from './validate';
import { StyleSpecification } from '../types.g';
import { v8 } from '..';

describe('Validate Sprite', () => {
    test('Should return error if type is not string or array', () => {
        let errors = validateState({validateSpec: validate, key: 'state', value: 3, style: {} as StyleSpecification, styleSpec: {} as typeof v8});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, number found');

        errors = validateState({validateSpec: validate, key: 'state', value: true, style: {} as StyleSpecification, styleSpec: {} as typeof v8});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, boolean found');

        errors = validateState({validateSpec: validate, key: 'state', value: null, style: {} as StyleSpecification, styleSpec: {} as typeof v8});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('state: object expected, null found');

    });

    test('Should pass if type is object', () => {
        const errors = validateState({validateSpec: validate, key: 'state', value: {}, style: {} as StyleSpecification, styleSpec: {} as typeof v8});
        expect(errors).toHaveLength(0);
    });
});
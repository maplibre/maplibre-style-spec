import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import validateArray from './validate_array';

export default function validateOffsetCollection(options): ValidationError[] {
    const key = options.key;
    const value = options.value;
    const type = getType(value);

    if (type !== 'array' || value.length < 1) {
        return [new ValidationError(key, value, 'offsetCollection requires a non-empty array')];
    }

    const elementType = getType(value[0]);

    if (elementType === 'number') {
        return validateArray({
            key,
            value,
            valueSpec: {
                length: 2,
                value: 'number'
            },
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec: options.styleSpec
        });
    } else if (elementType === 'array') {
        let errors = [];

        for (let i = 0; i < value.length; i++) {
            errors = errors.concat(validateArray({
                key: `${key}[${i}]`,
                value: value[i],
                valueSpec: {
                    length: 2,
                    value: 'number'
                },
                validateSpec: options.validateSpec,
                style: options.style,
                styleSpec: options.styleSpec
            }));
        }

        return errors;
    } else {
        return [new ValidationError(key, value, 'offsetCollection must be an array of numbers or points')];
    }
}

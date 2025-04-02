import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {isObjectLiteral} from '../util/is_object_literal';
import {validateStateProperty} from './validate_state_property';

interface ValidateStateOptions {
    key: 'state';
    value: unknown;
}

export function validateState(options: ValidateStateOptions) {
    if (!isObjectLiteral(options.value)) {
        return [
            new ValidationError(
                options.key,
                options.value,
                `object expected, ${getType(options.value)} found`
            ),
        ];
    }

    const errors = [];
    for (const key in options.value) {
        const schema = options.value[key];
        const propertyErrors = validateStateProperty({
            key: `${options.key}.${key}`,
            value: schema,
        });
        errors.push(...propertyErrors);
    }
    return errors;
}

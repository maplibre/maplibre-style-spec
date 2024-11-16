import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {validateArray} from './validate_array';
import {validateEnum} from './validate_enum';

export function validateVariableAnchorOffsetCollection(options): ValidationError[] {
    const key = options.key;
    const value = options.value;
    const type = getType(value);
    const styleSpec = options.styleSpec;

    if (type !== 'array' || value.length < 1 || value.length % 2 !== 0) {
        return [new ValidationError(key, value, 'variableAnchorOffsetCollection requires a non-empty array of even length')];
    }

    let errors = [];

    for (let i = 0; i < value.length; i += 2) {
        // Elements in even positions should be values from text-anchor enum
        errors = errors.concat(validateEnum({
            key: `${key}[${i}]`,
            value: value[i],
            valueSpec: styleSpec['layout_symbol']['text-anchor']
        }));

        // Elements in odd positions should be points (2-element numeric arrays)
        errors = errors.concat(validateArray({
            key: `${key}[${i + 1}]`,
            value: value[i + 1],
            valueSpec: {
                length: 2,
                value: 'number'
            },
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec
        }));
    }

    return errors;
}

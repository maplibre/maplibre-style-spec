import {ValidationError} from '../error/validation_error';
import {validateExpression} from './validate_expression';
import {validateEnum} from './validate_enum';
import {getType} from '../util/get_type';
import {unbundle, deepUnbundle} from '../util/unbundle_jsonlint';
import {extendBy as extend} from '../util/extend';
import {findMixedLegacyFilter, getMixedFilterMessage, isExpressionFilter} from '../feature_filter';

function getValueAtPath(value: any, path: number[]) {
    let current = value;
    for (const index of path) {
        current = current[index];
    }
    return current;
}

/**
 * Reports a filter that mixes deprecated syntax into an expression tree as a *warning*.
 * @param options The validation options, used for the key and the un-unbundled value
 * @param value The unbundled filter to inspect
 * @returns A single warning, or an empty array when nothing is mixed
 */
function validateNoMixedLegacyFilter(options: any, value: any): ValidationError[] {
    const diagnostic = findMixedLegacyFilter(value);
    if (!diagnostic) {
        return [];
    }
    const key = `${options.key}${diagnostic.path.map((index) => `[${index}]`).join('')}`;
    return [
        new ValidationError(
            key,
            getValueAtPath(options.value, diagnostic.path),
            getMixedFilterMessage(diagnostic.legacyFilter),
            null,
            'warning'
        )
    ];
}

export function validateFilter(options: any): ValidationError[] {
    const value = deepUnbundle(options.value);
    if (!isExpressionFilter(value)) {
        return validateNonExpressionFilter(options);
    }
    return [
        ...validateNoMixedLegacyFilter(options, value),
        ...validateExpression(
            extend({}, options, {
                expressionContext: 'filter',
                valueSpec: {value: 'boolean'}
            })
        )
    ];
}

function validateNonExpressionFilter(options: any): ValidationError[] {
    const value = options.value;
    const key = options.key;

    if (getType(value) !== 'array') {
        return [new ValidationError(key, value, `array expected, ${getType(value)} found`)];
    }

    const styleSpec = options.styleSpec;
    let type;

    let errors: ValidationError[] = [];

    if (value.length < 1) {
        return [new ValidationError(key, value, 'filter array must have at least 1 element')];
    }

    errors = errors.concat(
        validateEnum({
            key: `${key}[0]`,
            value: value[0],
            valueSpec: styleSpec.filter_operator,
            style: options.style,
            styleSpec: options.styleSpec
        })
    );

    switch (unbundle(value[0])) {
        case '<':
        case '<=':
        case '>':
        case '>=':
            if (value.length >= 2 && unbundle(value[1]) === '$type') {
                errors.push(
                    new ValidationError(
                        key,
                        value,
                        `"$type" cannot be use with operator "${value[0]}"`
                    )
                );
            }
        /* falls through */
        case '==':
        case '!=':
            if (value.length !== 3) {
                errors.push(
                    new ValidationError(
                        key,
                        value,
                        `filter array for operator "${value[0]}" must have 3 elements`
                    )
                );
            }
        /* falls through */
        case 'in':
        case '!in':
            if (value.length >= 2) {
                type = getType(value[1]);
                if (type !== 'string') {
                    errors.push(
                        new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`)
                    );
                }
            }
            for (let i = 2; i < value.length; i++) {
                type = getType(value[i]);
                if (unbundle(value[1]) === '$type') {
                    errors = errors.concat(
                        validateEnum({
                            key: `${key}[${i}]`,
                            value: value[i],
                            valueSpec: styleSpec.geometry_type,
                            style: options.style,
                            styleSpec: options.styleSpec
                        })
                    );
                } else if (type !== 'string' && type !== 'number' && type !== 'boolean') {
                    errors.push(
                        new ValidationError(
                            `${key}[${i}]`,
                            value[i],
                            `string, number, or boolean expected, ${type} found`
                        )
                    );
                }
            }
            break;

        case 'any':
        case 'all':
        case 'none':
            for (let i = 1; i < value.length; i++) {
                errors = errors.concat(
                    validateNonExpressionFilter({
                        key: `${key}[${i}]`,
                        value: value[i],
                        style: options.style,
                        styleSpec: options.styleSpec
                    })
                );
            }
            break;

        case 'has':
        case '!has':
            type = getType(value[1]);
            if (value.length !== 2) {
                errors.push(
                    new ValidationError(
                        key,
                        value,
                        `filter array for "${value[0]}" operator must have 2 elements`
                    )
                );
            } else if (type !== 'string') {
                errors.push(
                    new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`)
                );
            }
            break;
    }
    return errors;
}

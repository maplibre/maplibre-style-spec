import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {deepUnbundle, unbundle} from '../util/unbundle_jsonlint';
import {isObjectLiteral} from '../util/is_object_literal';

interface ValidateStatePropertyOptions {
    key: string;
    value: unknown;
    // Part of the property path representing the value key.
    // Pass null if "default" key is not appropriate (e.g. for array items and when value is set by the user)
    valueKey?: string;
}

export function validateStateProperty({
    key,
    value,
    valueKey = 'default',
}: ValidateStatePropertyOptions): ValidationError[] {
    if (!isObjectLiteral(value)) {
        return [
            new ValidationError(
                key,
                value,
                `object expected, ${getType(value)} found`
            ),
        ];
    }
    if (value.type === undefined && value.enum === undefined) {
        return [
            new ValidationError(
                key,
                value,
                'schema must have a "type" or "enum" property'
            ),
        ];
    }

    switch (unbundle(value.type)) {
        case 'string':
            return validateString(value, key, valueKey);
        case 'number':
            return validateNumber(value, key, valueKey);
        case 'boolean':
            return validateBoolean(value, key, valueKey);
        case 'array': {
            return validateArray(value, key, valueKey);
        }
        default: {
            if (value.type !== undefined) {
                return [
                    new ValidationError(
                        'type',
                        value.type,
                        'expected string, number, boolean or array'
                    ),
                ];
            }
        }
    }

    return validateEnum(value, key, valueKey);
}

function validateString(schema: Record<string, unknown>, key: string, valueKey: string = 'default') {
    const defaultValue = unbundle(schema.default) as string;
    const propertyKey = valueKey ? `${key}.${valueKey}` : key;

    if (defaultValue !== null && typeof defaultValue !== 'string') {
        return [
            new ValidationError(propertyKey, schema.default, 'string expected'),
        ];
    }

    return [];
}
function validateNumber(schema: Record<string, unknown>, key: string, valueKey: string = 'default') {
    const defaultValue = unbundle(schema.default) as number;
    const propertyKey = valueKey ? `${key}.${valueKey}` : key;

    if (defaultValue !== null && typeof defaultValue !== 'number') {
        return [
            new ValidationError(propertyKey, schema.default, 'number expected'),
        ];
    }

    if (schema.minimum !== undefined) {
        const minimum = unbundle(schema.minimum);
        if (typeof minimum !== 'number') {
            return [
                new ValidationError(
                    `${key}.minimum`,
                    schema.default,
                    'must be a number'
                ),
            ];
        }

        if (defaultValue !== null && defaultValue < minimum) {
            return [
                new ValidationError(
                    `${key}.default`,
                    schema.default,
                    `must be greater than or equal to ${minimum}`
                ),
            ];
        }
    }

    if (schema.maximum !== undefined) {
        const maximum = unbundle(schema.maximum);
        if (typeof maximum !== 'number') {
            return [
                new ValidationError(
                    `${key}.maximum`,
                    schema.default,
                    'must be a number'
                ),
            ];
        }

        if (defaultValue !== null && defaultValue > maximum) {
            return [
                new ValidationError(
                    `${key}.default`,
                    schema.default,
                    `must be less than or equal to ${maximum}`
                ),
            ];
        }
    }

    return [];
}

function validateBoolean(schema: Record<string, unknown>, key: string, valueKey: string = 'default') {
    const defaultValue = unbundle(schema.default) as boolean;
    const propertyKey = valueKey ? `${key}.${valueKey}` : key;

    if (defaultValue !== null && typeof defaultValue !== 'boolean') {
        return [
            new ValidationError(propertyKey, schema.default, 'boolean expected'),
        ];
    }

    return [];
}

function validateEnum(schema: Record<string, unknown>, key: string, valueKey: string = 'default') {
    const propertyKey = valueKey ? `${key}.${valueKey}` : key;
    if (!Array.isArray(schema.enum)) {
        return [
            new ValidationError(`${key}.enum`, schema.enum, 'expected an array'),
        ];
    }

    if (schema.enum.length === 0) {
        return [
            new ValidationError(
                `${key}.enum`,
                schema.enum,
                'expected at least 1 element'
            ),
        ];
    }

    if (
        !(deepUnbundle(schema.enum) as any[]).includes(unbundle(schema.default))
    ) {
        return [
            new ValidationError(
                propertyKey,
                schema.default,
                `expected one of the enum values: ${schema.enum.join(', ')}`
            ),
        ];
    }

    return [];
}

function validateArray(schema: Record<string, unknown>, key: string, valueKey: string = 'default') {
    const propertyKey = valueKey ? `${key}.${valueKey}` : key;
    if (!Array.isArray(schema.default)) {
        return [
            new ValidationError(propertyKey, schema.default, 'array expected'),
        ];
    }

    if (schema.items === undefined) {
        return [new ValidationError(`${key}.items`, schema.items, 'is required')];
    }

    if (!isObjectLiteral(schema.items)) {
        return [
            new ValidationError(`${key}.items`, schema.items, 'object expected'),
        ];
    }

    if (schema.items.type === undefined && schema.items.enum === undefined) {
        return [
            new ValidationError(
                `${key}.items`,
                schema.items,
                'must have a "type" or "enum" property'
            ),
        ];
    }

    const errors = [];

    for (let index = 0; index < schema.default.length; index++) {
        const item = schema.default[index];
        const itemErrors = validateStateProperty({
            key: `${key}.default[${index}]`,
            valueKey: null,
            value: {
                ...schema.items,
                default: item,
            },
        });

        errors.push(...itemErrors);
    }

    return errors;
}

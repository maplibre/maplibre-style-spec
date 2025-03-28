import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {deepUnbundle, unbundle} from '../util/unbundle_jsonlint';
import {isObjectLiteral} from '../util/is_object_literal';

interface ValidateSchemaOptions {
    key: string;
    value: unknown;
}

export function validateSchema({
    key,
    value,
}: ValidateSchemaOptions): ValidationError[] {
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
    if (value.default === undefined) {
        return [new ValidationError(`${key}`, value, 'default is required')];
    }

    switch (unbundle(value.type)) {
        case 'string':
            return validateString(value, key);
        case 'number':
            return validateNumber(value, key);
        case 'boolean':
            return validateBoolean(value, key);
        case 'array': {
            return validateArray(value, key);
        }
        default: {
            if (value.type !== undefined) {
                return [
                    new ValidationError(
                        'type',
                        value.type,
                        'expected string, number or boolean'
                    ),
                ];
            }
        }
    }

    return validateEnum(value, key);
}

function validateString(schema: Record<string, unknown>, key: string) {
    if (typeof unbundle(schema.default) !== 'string') {
        return [
            new ValidationError(`${key}.default`, schema.default, 'string expected'),
        ];
    }

    return [];
}
function validateNumber(schema: Record<string, unknown>, key: string) {
    const defaultValue = unbundle(schema.default);
    if (defaultValue === undefined) {
        return [
            new ValidationError(
                `${key}.default`,
                schema.default,
                'default is required'
            ),
        ];
    }

    if (typeof defaultValue !== 'number') {
        return [
            new ValidationError(`${key}.default`, schema.default, 'number expected'),
        ];
    }

    if (schema.minimum !== undefined) {
        const minimum = unbundle(schema.minimum);
        if (typeof minimum !== 'number') {
            return [
                new ValidationError(
                    `${key}.default`,
                    schema.default,
                    'must be a number'
                ),
            ];
        }

        if (defaultValue < minimum) {
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
                    `${key}.default`,
                    schema.default,
                    'must be a number'
                ),
            ];
        }

        if (defaultValue > maximum) {
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

function validateEnum(schema: Record<string, unknown>, key: string) {
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
                `${key}.default`,
                schema.default,
                'expected one of the enum values: ' + schema.enum.join(', ')
            ),
        ];
    }

    return [];
}

function validateArray(schema: Record<string, unknown>, key: string) {
    if (!Array.isArray(schema.default)) {
        return [
            new ValidationError(`${key}.default`, schema.default, 'array expected'),
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
        const itemErrors = validateSchema({
            key: `${key}[${index}]`,
            value: {
                ...schema.items,
                default: item,
            },
        });

        errors.push(...itemErrors);
    }

    return errors;
}

function validateBoolean(schema: Record<string, unknown>, key: string) {
    if (typeof unbundle(schema.default) != 'boolean') {
        return [
            new ValidationError(`${key}.default`, schema.default, 'boolean expected'),
        ];
    }

    return [];
}

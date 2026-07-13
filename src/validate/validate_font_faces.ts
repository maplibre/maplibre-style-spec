import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {isObjectLiteral} from '../util/is_object_literal';
import {validateObject} from './validate_object';
import {validateString} from './validate_string';
import v8 from '../reference/v8.json' with {type: 'json'};
import type {StyleSpecification} from '../types.g';

interface ValidateFontFacesOptions {
    key: string;
    value: unknown;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export function validateFontFaces(options: ValidateFontFacesOptions): ValidationError[] {
    const key = options.key;
    const value = options.value;
    const validateSpec = options.validateSpec;
    const styleSpec = options.styleSpec;
    const style = options.style;

    if (!isObjectLiteral(value)) {
        return [new ValidationError(key, value, `object expected, ${getType(value)} found`)];
    }

    const errors: ValidationError[] = [];

    for (const fontName in value) {
        const fontValue = value[fontName];
        const fontValueType = getType(fontValue);

        if (fontValueType === 'string') {
            // Validate as a string URL
            errors.push(
                ...validateString({
                    key: `${key}.${fontName}`,
                    value: fontValue
                })
            );
        } else if (fontValueType === 'array') {
            // Validate as an array of font face objects
            const fontFaceSpec = {
                url: {
                    type: 'string',
                    required: true
                },
                'unicode-range': {
                    type: 'array',
                    value: 'string'
                }
            };

            for (const [i, fontFace] of (fontValue as any[]).entries()) {
                errors.push(
                    ...validateObject({
                        key: `${key}.${fontName}[${i}]`,
                        value: fontFace,
                        valueSpec: fontFaceSpec,
                        styleSpec,
                        style,
                        validateSpec
                    })
                );
            }
        } else {
            errors.push(
                new ValidationError(
                    `${key}.${fontName}`,
                    fontValue,
                    `string or array expected, ${fontValueType} found`
                )
            );
        }
    }

    return errors;
}

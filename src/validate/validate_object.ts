import {ValidationError} from '../error/validation_error';
import {getOwn} from '../util/get_own';
import {getType} from '../util/get_type';

export function validateObject(options): Array<ValidationError> {
    const key = options.key;
    const object = options.value;
    const elementSpecs = options.valueSpec || {};
    const elementValidators = options.objectElementValidators || {};
    const style = options.style;
    const styleSpec = options.styleSpec;
    const validateSpec = options.validateSpec;
    let errors: ValidationError[] = [];

    const type = getType(object);
    if (type !== 'object') {
        return [new ValidationError(key, object, `object expected, ${type} found`)];
    }

    for (const objectKey in object) {
        const elementSpecKey = objectKey.split('.')[0]; // treat 'paint.*' as 'paint'
        // objectKey comes from the user controlled style input, so elementSpecKey may be e.g. "__proto__"
        const elementSpec = getOwn(elementSpecs, elementSpecKey) || elementSpecs['*'];

        let validateElement;
        if (getOwn(elementValidators, elementSpecKey)) {
            validateElement = elementValidators[elementSpecKey];
        } else if (getOwn(elementSpecs, elementSpecKey)) {
            if (object[objectKey] === undefined) {
                // property is possible, set but set to undefined
                // we only check it if it is required and not defaulted in the next loop
                // without skipping here, we would alert to properties being set to undefined
                continue;
            }
            validateElement = validateSpec;
        } else if (elementValidators['*']) {
            validateElement = elementValidators['*'];
        } else if (elementSpecs['*']) {
            validateElement = validateSpec;
        } else {
            errors.push(
                new ValidationError(key, object[objectKey], `unknown property "${objectKey}"`)
            );
            continue;
        }

        errors = errors.concat(
            validateElement(
                {
                    key: (key ? `${key}.` : key) + objectKey,
                    value: object[objectKey],
                    valueSpec: elementSpec,
                    style,
                    styleSpec,
                    object,
                    objectKey,
                    validateSpec
                },
                object
            )
        );
    }

    for (const elementSpecKey in elementSpecs) {
        // Don't check `required` when there's a custom validator for that property.
        if (elementValidators[elementSpecKey]) {
            continue;
        }

        if (
            elementSpecs[elementSpecKey].required &&
            elementSpecs[elementSpecKey]['default'] === undefined &&
            object[elementSpecKey] === undefined
        ) {
            errors.push(
                new ValidationError(key, object, `missing required property "${elementSpecKey}"`)
            );
        }
    }

    return errors;
}

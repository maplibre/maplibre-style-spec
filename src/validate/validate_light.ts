import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import {transitionPropertyRegExp} from '../util/properties';
import {getOwn} from '../util/get_own';

export function validateLight(options) {
    const light = options.value;
    const styleSpec = options.styleSpec;
    const lightSpec = styleSpec.light;
    const style = options.style;

    let errors = [];

    const rootType = getType(light);
    if (light === undefined) {
        return errors;
    } else if (rootType !== 'object') {
        errors = errors.concat([
            new ValidationError('light', light, `object expected, ${rootType} found`)
        ]);
        return errors;
    }

    for (const key in light) {
        const transitionMatch = key.match(transitionPropertyRegExp);

        if (
            transitionMatch &&
            getOwn<Record<string, any>>(lightSpec, transitionMatch[1])?.transition
        ) {
            errors = errors.concat(
                options.validateSpec({
                    key,
                    value: light[key],
                    valueSpec: styleSpec.transition,
                    validateSpec: options.validateSpec,
                    style,
                    styleSpec
                })
            );
        } else if (getOwn(lightSpec, key)) {
            errors = errors.concat(
                options.validateSpec({
                    key,
                    value: light[key],
                    valueSpec: lightSpec[key],
                    validateSpec: options.validateSpec,
                    style,
                    styleSpec,
                    expressionContext: 'property'
                })
            );
        } else {
            errors = errors.concat([
                new ValidationError(key, light[key], `unknown property "${key}"`)
            ]);
        }
    }

    return errors;
}

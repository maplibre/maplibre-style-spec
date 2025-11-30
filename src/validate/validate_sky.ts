import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {SkySpecification, StyleSpecification} from '../types.g';

interface ValidateSkyOptions {
    sourceName?: string;
    value: SkySpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export function validateSky(options: ValidateSkyOptions) {
    const sky = options.value;
    const styleSpec = options.styleSpec;
    const skySpec = styleSpec.sky;
    const style = options.style;

    const rootType = getType(sky);
    if (sky === undefined) {
        return [];
    } else if (rootType !== 'object') {
        return [new ValidationError('sky', sky, `object expected, ${rootType} found`)];
    }

    let errors = [];
    for (const key in sky) {
        if (skySpec[key]) {
            errors = errors.concat(
                options.validateSpec({
                    key,
                    value: sky[key],
                    valueSpec: skySpec[key],
                    style,
                    styleSpec
                })
            );
        } else {
            errors = errors.concat([
                new ValidationError(key, sky[key], `unknown property "${key}"`)
            ]);
        }
    }

    return errors;
}

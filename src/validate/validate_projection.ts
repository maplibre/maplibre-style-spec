import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {ProjectionSpecification, StyleSpecification} from '../types.g';

interface ValidateProjectionOptions {
    sourceName?: string;
    value: ProjectionSpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export function validateProjection(options: ValidateProjectionOptions) {
    const projection = options.value;
    const styleSpec = options.styleSpec;
    const projectionSpec = styleSpec.projection;
    const style = options.style;

    const rootType = getType(projection);
    if (projection === undefined) {
        return [];
    } else if (rootType !== 'object') {
        return [
            new ValidationError('projection', projection, `object expected, ${rootType} found`)
        ];
    }

    let errors = [];
    for (const key in projection) {
        if (projectionSpec[key]) {
            errors = errors.concat(
                options.validateSpec({
                    key,
                    value: projection[key],
                    valueSpec: projectionSpec[key],
                    style,
                    styleSpec
                })
            );
        } else {
            errors = errors.concat([
                new ValidationError(key, projection[key], `unknown property "${key}"`)
            ]);
        }
    }

    return errors;
}

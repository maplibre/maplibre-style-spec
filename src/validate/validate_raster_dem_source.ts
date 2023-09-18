import ValidationError from '../error/validation_error';
import getType from '../util/get_type';
import type {RasterDEMSourceSpecification, StyleSpecification} from '../types.g';
import v8 from '../reference/v8.json' assert {type: 'json'};

interface ValidateRasterDENSourceOptions {
    value: RasterDEMSourceSpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export default function validateRasterDEMSource(
    options: ValidateRasterDENSourceOptions
): ValidationError[] {

    const rasterDEM = options.value;
    const styleSpec = options.styleSpec;
    const rasterDEMSpec = styleSpec.source_raster_dem;
    const style = options.style;

    let errors = [];

    const rootType = getType(rasterDEM);
    if (rasterDEM === undefined) {
        return errors;
    } else if (rootType !== 'object') {
        errors.push(new ValidationError('source_raster_dem', rasterDEM, `object expected, ${rootType} found`));
        return errors;
    }

    const isCustomEncoding = options.value.encoding === 'custom';
    const customEncodingKeys = ['redFactor', 'greenFactor', 'blueFactor', 'baseShift'];

    for (const key in rasterDEM) {
        if (!isCustomEncoding && customEncodingKeys.includes(key)) {
            errors.push(new ValidationError(key, rasterDEM[key], `"${key}" is only valid when "encoding" is set to "custom". ${options.value.encoding} encoding found`));
        } else if (rasterDEMSpec[key]) {
            errors = errors.concat(options.validateSpec({
                key,
                value: rasterDEM[key],
                valueSpec: rasterDEMSpec[key],
                validateSpec: options.validateSpec,
                style,
                styleSpec
            }));
        } else {
            errors.push(new ValidationError(key, rasterDEM[key], `unknown property "${key}"`));
        }
    }

    return errors;
}

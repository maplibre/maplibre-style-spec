import {ValidationError} from '../error/validation_error';
import {unbundle} from '../util/unbundle_jsonlint';
import {validateObject} from './validate_object';
import {validateEnum} from './validate_enum';
import {validateExpression} from './validate_expression';
import {validateString} from './validate_string';
import {getType} from '../util/get_type';
import {validateRasterDEMSource} from './validate_raster_dem_source';

const objectElementValidators = {
    promoteId: validatePromoteId
};

export function validateSource(options) {
    const value = options.value;
    const key = options.key;
    const styleSpec = options.styleSpec;
    const style = options.style;
    const validateSpec = options.validateSpec;

    if (getType(value) !== 'object') {
        return [new ValidationError(key, value, `object expected, ${getType(value)} found`)];
    }

    if (!value.type) {
        return [new ValidationError(key, value, '"type" is required')];
    }

    const type = unbundle(value.type);
    let errors;

    switch (type) {
        case 'vector':
        case 'raster':
            errors = validateObject({
                key,
                value,
                valueSpec: styleSpec[`source_${type.replace('-', '_')}`],
                style: options.style,
                styleSpec,
                objectElementValidators,
                validateSpec
            });
            return errors;
        case 'raster-dem':
            errors = validateRasterDEMSource({
                sourceName: key,
                value,
                style: options.style,
                styleSpec,
                validateSpec
            });
            return errors;

        case 'geojson':
            errors = validateObject({
                key,
                value,
                valueSpec: styleSpec.source_geojson,
                style,
                styleSpec,
                validateSpec,
                objectElementValidators
            });
            if (value.cluster && value.clusterProperties !== undefined) {
                if (getType(value.clusterProperties) !== 'object') {
                    errors.push(
                        new ValidationError(
                            `${key}.clusterProperties`,
                            value.clusterProperties,
                            `object expected, ${getType(value.clusterProperties)} found`
                        )
                    );
                    return errors;
                }
                for (const prop in value.clusterProperties) {
                    const clusterProperty = value.clusterProperties[prop];
                    if (getType(clusterProperty) !== 'array') {
                        errors.push(
                            new ValidationError(
                                `${key}.${prop}`,
                                clusterProperty,
                                `array expected, ${getType(clusterProperty)} found`
                            )
                        );
                        continue;
                    }
                    const [operator, mapExpr] = clusterProperty;
                    const reduceExpr =
                        typeof operator === 'string'
                            ? [operator, ['accumulated'], ['get', prop]]
                            : operator;

                    errors.push(
                        ...validateExpression({
                            key: `${key}.${prop}.map`,
                            value: mapExpr,
                            validateSpec,
                            expressionContext: 'cluster-map'
                        })
                    );
                    errors.push(
                        ...validateExpression({
                            key: `${key}.${prop}.reduce`,
                            value: reduceExpr,
                            validateSpec,
                            expressionContext: 'cluster-reduce'
                        })
                    );
                }
            }
            return errors;

        case 'video':
            return validateObject({
                key,
                value,
                valueSpec: styleSpec.source_video,
                style,
                validateSpec,
                styleSpec
            });

        case 'image':
            return validateObject({
                key,
                value,
                valueSpec: styleSpec.source_image,
                style,
                validateSpec,
                styleSpec
            });

        case 'canvas':
            return [
                new ValidationError(
                    key,
                    null,
                    'Please use runtime APIs to add canvas sources, rather than including them in stylesheets.',
                    'source.canvas'
                )
            ];

        default:
            return validateEnum({
                key: `${key}.type`,
                value: value.type,
                valueSpec: {
                    values: ['vector', 'raster', 'raster-dem', 'geojson', 'video', 'image']
                },
                style,
                validateSpec,
                styleSpec
            });
    }
}

function validatePromoteId({key, value}) {
    if (getType(value) === 'string') {
        return validateString({key, value});
    } else {
        const errors = [];
        for (const prop in value) {
            errors.push(...validateString({key: `${key}.${prop}`, value: value[prop]}));
        }
        return errors;
    }
}

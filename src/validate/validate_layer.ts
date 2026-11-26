import {ValidationError} from '../error/validation_error';
import {unbundle} from '../util/unbundle_jsonlint';
import {validateObject} from './validate_object';
import {validateFilter} from './validate_filter';
import {validatePaintProperty} from './validate_paint_property';
import {validateLayoutProperty} from './validate_layout_property';
import {getType} from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import type {GeoJSONSourceSpecification, StyleSpecification} from '../types.g';
import {getOwn} from '../util/get_own';
import {toDisplayString} from '../util/to_display_string';

/** What {@link validateLayer} is given, and what it passes on to the validators of the layer's members. */
type ValidateLayerOptions = {
    key: string;
    /**
     * The value as the style has it, before it is validated: it may not be an object at all, and its strings may
     * carry the line numbers of the JSON parser.
     */
    value: any;
    style: StyleSpecification;
    styleSpec: typeof v8;
    validateSpec: Function;
    /** The layer's position in `layers`; the layers before it are checked for a duplicate id. */
    arrayIndex?: number;
};

export function validateLayer(options: ValidateLayerOptions) {
    let errors = [];

    const layer = options.value;
    const key = options.key;
    const style = options.style;
    const styleSpec = options.styleSpec;

    if (getType(layer) !== 'object') {
        return [new ValidationError(key, layer, `object expected, ${getType(layer)} found`)];
    }

    if (!layer.type && !layer.ref) {
        errors.push(new ValidationError(key, layer, 'either "type" or "ref" is required'));
    }
    let type = unbundle(layer.type);
    const ref = unbundle(layer.ref);

    if (layer.id) {
        const layerId = unbundle(layer.id);
        for (let i = 0; i < options.arrayIndex; i++) {
            const otherLayer = style.layers[i];
            // other layers are not necessarily valid, they may not even be objects
            if (getType(otherLayer) === 'object' && unbundle(otherLayer.id) === layerId) {
                errors.push(
                    new ValidationError(
                        key,
                        layer.id,
                        `duplicate layer id "${toDisplayString(layer.id)}", previously used at line ${(otherLayer.id as unknown as {__line__: number}).__line__}`
                    )
                );
            }
        }
    }

    if ('ref' in layer) {
        ['type', 'source', 'source-layer', 'filter', 'layout'].forEach((p) => {
            if (p in layer) {
                errors.push(
                    new ValidationError(key, layer[p], `"${p}" is prohibited for ref layers`)
                );
            }
        });

        let parent;

        style.layers.forEach((layer) => {
            if (getType(layer) === 'object' && unbundle(layer.id) === ref) parent = layer;
        });

        if (!parent) {
            errors.push(
                new ValidationError(key, layer.ref, `ref layer "${toDisplayString(ref)}" not found`)
            );
        } else if (parent.ref) {
            errors.push(
                new ValidationError(key, layer.ref, 'ref cannot reference another ref layer')
            );
        } else {
            type = unbundle(parent.type);
        }
    } else if (type !== 'background') {
        if (!layer.source) {
            errors.push(new ValidationError(key, layer, 'missing required property "source"'));
        } else {
            const sourceId = toDisplayString(layer.source);
            const source = style.sources && getOwn<Record<string, any>>(style.sources, sourceId);
            const sourceType = source && unbundle(source.type);
            if (!source) {
                errors.push(
                    new ValidationError(key, layer.source, `source "${sourceId}" not found`)
                );
            } else if (sourceType === 'vector' && type === 'raster') {
                errors.push(
                    new ValidationError(
                        key,
                        layer.source,
                        `layer "${toDisplayString(layer.id)}" requires a raster source`
                    )
                );
            } else if (sourceType !== 'raster-dem' && type === 'hillshade') {
                errors.push(
                    new ValidationError(
                        key,
                        layer.source,
                        `layer "${toDisplayString(layer.id)}" requires a raster-dem source`
                    )
                );
            } else if (sourceType !== 'raster-dem' && type === 'color-relief') {
                errors.push(
                    new ValidationError(
                        key,
                        layer.source,
                        `layer "${toDisplayString(layer.id)}" requires a raster-dem source`
                    )
                );
            } else if (sourceType === 'raster' && type !== 'raster') {
                errors.push(
                    new ValidationError(
                        key,
                        layer.source,
                        `layer "${toDisplayString(layer.id)}" requires a vector source`
                    )
                );
            } else if (sourceType === 'vector' && !layer['source-layer']) {
                errors.push(
                    new ValidationError(
                        key,
                        layer,
                        `layer "${toDisplayString(layer.id)}" must specify a "source-layer"`
                    )
                );
            } else if (
                sourceType === 'raster-dem' &&
                type !== 'hillshade' &&
                type !== 'color-relief'
            ) {
                errors.push(
                    new ValidationError(
                        key,
                        layer.source,
                        "raster-dem source can only be used with layer type 'hillshade' or 'color-relief'."
                    )
                );
            } else if (
                type === 'line' &&
                layer.paint &&
                layer.paint['line-gradient'] &&
                (sourceType !== 'geojson' || !(source as GeoJSONSourceSpecification).lineMetrics)
            ) {
                errors.push(
                    new ValidationError(
                        key,
                        layer,
                        `layer "${toDisplayString(layer.id)}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`
                    )
                );
            }
        }
    }

    if (type === 'raster' && layer.paint?.resampling && layer.paint?.['raster-resampling']) {
        errors.push(
            new ValidationError(
                key,
                layer.paint,
                `layer "${toDisplayString(layer.id)}" redundantly specifies "resampling" and "raster-resampling" paint properties, but only one is allowed. It is advised to use "resampling".`
            )
        );
    }

    errors = errors.concat(
        validateObject({
            key,
            value: layer,
            valueSpec: styleSpec.layer,
            style: options.style,
            styleSpec: options.styleSpec,
            validateSpec: options.validateSpec,
            objectElementValidators: {
                '*'() {
                    return [];
                },
                // We don't want to enforce the spec's `"requires": true` for backward compatibility with refs;
                // the actual requirement is validated above. See https://github.com/mapbox/mapbox-gl-js/issues/5772.
                type() {
                    return options.validateSpec({
                        key: `${key}.type`,
                        value: layer.type,
                        valueSpec: styleSpec.layer.type,
                        style: options.style,
                        styleSpec: options.styleSpec,
                        validateSpec: options.validateSpec,
                        object: layer,
                        objectKey: 'type'
                    });
                },
                filter(options: ValidateLayerOptions) {
                    return validateFilter({layerType: type, ...options});
                },
                layout(options: ValidateLayerOptions) {
                    return validateObject({
                        layer,
                        key: options.key,
                        value: options.value,
                        style: options.style,
                        styleSpec: options.styleSpec,
                        validateSpec: options.validateSpec,
                        objectElementValidators: {
                            '*'(options: ValidateLayerOptions) {
                                return validateLayoutProperty({layerType: type, ...options});
                            }
                        }
                    });
                },
                paint(options: ValidateLayerOptions) {
                    return validateObject({
                        layer,
                        key: options.key,
                        value: options.value,
                        style: options.style,
                        styleSpec: options.styleSpec,
                        validateSpec: options.validateSpec,
                        objectElementValidators: {
                            '*'(options: ValidateLayerOptions) {
                                return validatePaintProperty({layerType: type, ...options});
                            }
                        }
                    });
                }
            }
        })
    );

    return errors;
}

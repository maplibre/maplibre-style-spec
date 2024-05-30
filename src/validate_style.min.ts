
import validateConstants from './validate/validate_constants';
import validate from './validate/validate';
import latestStyleSpec from './reference/latest';

import validateSource from './validate/validate_source';
import validateLight from './validate/validate_light';
import validateSky from './validate/validate_sky';
import validateTerrain from './validate/validate_terrain';
import validateLayer from './validate/validate_layer';
import validateFilter from './validate/validate_filter';
import validatePaintProperty from './validate/validate_paint_property';
import validateLayoutProperty from './validate/validate_layout_property';
import validateSprite from './validate/validate_sprite';
import validateGlyphsUrl from './validate/validate_glyphs_url';
import ValidationError from './error/validation_error';
import type {StyleSpecification} from './types.g';

/**
 * Validate a MapLibre style against the style specification.
 * Use this when running in the browser.
 *
 * @param style - The style to be validated.
 * @param styleSpec - The style specification to validate against.
 * If omitted, the latest style spec is used.
 * @returns an array of errors, or an empty array if no errors are found.
 * @example
 *   const validate = require('@maplibre/maplibre-gl-style-spec/').validateStyleMin;
 *   const errors = validate(style);
 */
function validateStyleMin(style: StyleSpecification, styleSpec = latestStyleSpec): Array<ValidationError> {

    let errors: ValidationError[] = [];

    errors = errors.concat(validate({
        key: '',
        value: style,
        valueSpec: styleSpec.$root,
        styleSpec,
        style,
        validateSpec: validate,
        objectElementValidators: {
            glyphs: validateGlyphsUrl,
            '*'() {
                return [];
            }
        }
    }));

    if (style['constants']) {
        errors = errors.concat(validateConstants({
            key: 'constants',
            value: style['constants'],
            style,
            styleSpec,
            validateSpec: validate,
        }));
    }

    return sortErrors(errors);
}

validateStyleMin.source = wrapCleanErrors(injectValidateSpec(validateSource));
validateStyleMin.sprite = wrapCleanErrors(injectValidateSpec(validateSprite));
validateStyleMin.glyphs = wrapCleanErrors(injectValidateSpec(validateGlyphsUrl));
validateStyleMin.light = wrapCleanErrors(injectValidateSpec(validateLight));
validateStyleMin.sky = wrapCleanErrors(injectValidateSpec(validateSky));
validateStyleMin.terrain = wrapCleanErrors(injectValidateSpec(validateTerrain));
validateStyleMin.layer = wrapCleanErrors(injectValidateSpec(validateLayer));
validateStyleMin.filter = wrapCleanErrors(injectValidateSpec(validateFilter));
validateStyleMin.paintProperty = wrapCleanErrors(injectValidateSpec(validatePaintProperty));
validateStyleMin.layoutProperty = wrapCleanErrors(injectValidateSpec(validateLayoutProperty));

function injectValidateSpec(validator: (options: object) => any) {
    return function(options) {
        return validator({
            ...options,
            validateSpec: validate,
        });
    };
}

function sortErrors(errors) {
    return [].concat(errors).sort((a, b) => {
        return a.line - b.line;
    });
}

function wrapCleanErrors(inner) {
    return function(...args) {
        return sortErrors(inner.apply(this, args));
    };
}

export default validateStyleMin;

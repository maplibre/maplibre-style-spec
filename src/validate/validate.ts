
import {extendBy} from '../util/extend';
import {unbundle, deepUnbundle} from '../util/unbundle_jsonlint';
import {isExpression} from '../expression';
import {isFunction} from '../function';

import {validateFunction} from './validate_function';
import {validateExpression} from './validate_expression';
import {validateObject} from './validate_object';
import {validateArray} from './validate_array';
import {validateBoolean} from './validate_boolean';
import {validateNumber} from './validate_number';
import {validateColor} from './validate_color';
import {validateConstants} from './validate_constants';
import {validateEnum} from './validate_enum';
import {validateFilter} from './validate_filter';
import {validateLayer} from './validate_layer';
import {validateSource} from './validate_source';
import {validateLight} from './validate_light';
import {validateSky} from './validate_sky';
import {validateTerrain} from './validate_terrain';
import {validateString} from './validate_string';
import {validateFormatted} from './validate_formatted';
import {validateImage} from './validate_image';
import {validatePadding} from './validate_padding';
import {validateNumberArray} from './validate_number_array';
import {validateColorArray} from './validate_color_array';
import {validateVariableAnchorOffsetCollection} from './validate_variable_anchor_offset_collection';
import {validateSprite} from './validate_sprite';
import {ValidationError} from '../error/validation_error';
import {validateProjection} from './validate_projection';
import {validateProjectionDefinition} from './validate_projectiondefinition';
import {validateState} from './validate_state';

const VALIDATORS = {
    '*'() {
        return [];
    },
    'array': validateArray,
    'boolean': validateBoolean,
    'number': validateNumber,
    'color': validateColor,
    'constants': validateConstants,
    'enum': validateEnum,
    'filter': validateFilter,
    'function': validateFunction,
    'layer': validateLayer,
    'object': validateObject,
    'source': validateSource,
    'light': validateLight,
    'sky': validateSky,
    'terrain': validateTerrain,
    'projection': validateProjection,
    'projectionDefinition': validateProjectionDefinition,
    'string': validateString,
    'formatted': validateFormatted,
    'resolvedImage': validateImage,
    'padding': validatePadding,
    'numberArray': validateNumberArray,
    'colorArray': validateColorArray,
    'variableAnchorOffsetCollection': validateVariableAnchorOffsetCollection,
    'sprite': validateSprite,
    'state': validateState
};

/**
 * Main recursive validation function used internally.
 * You should use `validateStyleMin` in the browser or `validateStyle` in node env.
 * @param options - the options object
 * @param options.key - string representing location of validation in style tree. Used only
 * for more informative error reporting.
 * @param options.value - current value from style being evaluated. May be anything from a
 * high level object that needs to be descended into deeper or a simple
 * scalar value.
 * @param options.valueSpec - current spec being evaluated. Tracks value.
 * @param options.styleSpec - current full spec being evaluated.
 * @param options.validateSpec - the validate function itself
 * @param options.style - the style object
 * @param options.objectElementValidators - optional object of functions that will be called
 * @returns an array of errors, or an empty array if no errors are found.
 */
export function validate(options: {
    key: any;
    value: any;
    valueSpec: any;
    styleSpec: any;
    validateSpec?: any;
    style: any;
    objectElementValidators?: any;}): ValidationError[] {
    const value = options.value;
    const valueSpec = options.valueSpec;
    const styleSpec = options.styleSpec;
    options.validateSpec = validate;

    if (valueSpec.expression && isFunction(unbundle(value))) {
        return validateFunction(options);

    } else if (valueSpec.expression && isExpression(deepUnbundle(value))) {
        return validateExpression(options);

    } else if (valueSpec.type && VALIDATORS[valueSpec.type]) {
        return VALIDATORS[valueSpec.type](options);

    } else {
        const valid = validateObject(extendBy({}, options, {
            valueSpec: valueSpec.type ? styleSpec[valueSpec.type] : valueSpec
        }));
        return valid;
    }
}

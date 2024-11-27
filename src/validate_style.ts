
import {validateStyleMin} from './validate_style.min';
import {v8, ValidationError} from '.';
import {readStyle} from './read_style';
import type {StyleSpecification} from './types.g';

/**
 * Validate a MapLibre GL style against the style specification.
 *
 * @param style - The style to be validated. If a `String` or `Buffer` is provided,
 * the returned errors will contain line numbers.
 * @param styleSpec - The style specification to validate against.
 * If omitted, the spec version is inferred from the stylesheet.
 * @returns an array of errors, or an empty array if no errors are found.
 * @example
 *   const validate = require('maplibre-gl-style-spec').validate;
 *   const style = fs.readFileSync('./style.json', 'utf8');
 *   const errors = validate(style);
 */

export function validateStyle(style: StyleSpecification | string | Buffer, styleSpec = v8): Array<ValidationError> {
    let s = style;

    try {
        s = readStyle(s);
    } catch (e) {
        return [e];
    }

    return validateStyleMin(s, styleSpec);
}

export const source = validateStyleMin.source;
export const light = validateStyleMin.light;
export const sky = validateStyleMin.sky;
export const terrain = validateStyleMin.terrain;
export const layer = validateStyleMin.layer;
export const filter = validateStyleMin.filter;
export const paintProperty = validateStyleMin.paintProperty;
export const layoutProperty = validateStyleMin.layoutProperty;

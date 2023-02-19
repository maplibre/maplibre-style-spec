/// <reference types="node" />
import { ValidationError } from './style-spec';
import type { StyleSpecification } from './types.g';
/**
 * Validate a Mapbox GL style against the style specification.
 *
 * @private
 * @alias validate
 * @param {StyleSpecification|string|Buffer} style The style to be validated. If a `String`
 *     or `Buffer` is provided, the returned errors will contain line numbers.
 * @param {Object} [styleSpec] The style specification to validate against.
 *     If omitted, the spec version is inferred from the stylesheet.
 * @returns {Array<ValidationError|ParsingError>}
 * @example
 *   var validate = require('maplibre-gl-style-spec').validate;
 *   var style = fs.readFileSync('./style.json', 'utf8');
 *   var errors = validate(style);
 */
export default function validateStyle(style: StyleSpecification | string | Buffer, styleSpec?: any): Array<ValidationError>;
export declare const source: (...args: any[]) => any[];
export declare const light: (...args: any[]) => any[];
export declare const terrain: (...args: any[]) => any[];
export declare const layer: (...args: any[]) => any[];
export declare const filter: (...args: any[]) => any[];
export declare const paintProperty: (...args: any[]) => any[];
export declare const layoutProperty: (...args: any[]) => any[];

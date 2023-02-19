import type { StyleSpecification } from './types.g';
/**
 * Validate a MapLibre GL style against the style specification. This entrypoint,
 * `maplibre-gl-style-spec/lib/validate_style.min`, is designed to produce as
 * small a browserify bundle as possible by omitting unnecessary functionality
 * and legacy style specifications.
 *
 * @private
 * @param {Object} style The style to be validated.
 * @param {Object} [styleSpec] The style specification to validate against.
 *     If omitted, the latest style spec is used.
 * @returns {Array<ValidationError>}
 * @example
 *   var validate = require('maplibre-gl-style-spec/lib/validate_style.min');
 *   var errors = validate(style);
 */
declare function validateStyleMin(style: StyleSpecification, styleSpec?: any): any[];
declare namespace validateStyleMin {
    var source: (...args: any[]) => any[];
    var sprite: (...args: any[]) => any[];
    var glyphs: (...args: any[]) => any[];
    var light: (...args: any[]) => any[];
    var terrain: (...args: any[]) => any[];
    var layer: (...args: any[]) => any[];
    var filter: (...args: any[]) => any[];
    var paintProperty: (...args: any[]) => any[];
    var layoutProperty: (...args: any[]) => any[];
}
export default validateStyleMin;

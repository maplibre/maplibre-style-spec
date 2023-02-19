export default declassStyle;
/**
 * Returns a new style with the given 'paint classes' merged into each layer's
 * main `paint` definiton, and with all `paint.*` properties removed.
 *
 * @private
 * @param {Object} style A style JSON object.
 * @param {Array<string>} classes An array of paint classes to apply, in order.
 *
 * @example
 * var declass = require('maplibre-gl-style-spec/lib/declass')
 * var baseStyle = { ... style with a 'paint.night' property in some layers ... }
 * var nightStyle = declass(baseStyle, ['night'])
 * // nightStyle now has each layer's `paint.night` properties merged in to the
 * // main `paint` property.
 */
declare function declassStyle(style: any, classes: any): any;

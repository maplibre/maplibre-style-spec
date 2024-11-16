
import {extendBy} from './util/extend';

/**
 * Returns a new style with the given 'paint classes' merged into each layer's
 * main `paint` definition, and with all `paint.*` properties removed.
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
export function declassStyle(style, classes) {
    return extendBy({}, style, {
        layers: style.layers.map((layer) => {
            const result = classes.reduce(declassLayer, layer);

            // strip away all `paint.CLASS` definitions
            for (const key in result) {
                if (/paint\..*/.test(key)) {
                    delete result[key];
                }
            }

            return result;
        })
    });
}

function declassLayer(layer, klass) {
    return extendBy({}, layer, {
        paint: extendBy({}, layer.paint, layer[`paint.${klass}`])
    });
}

import {latest} from './reference/latest';
import stringifyPretty from 'json-stringify-pretty-compact';

function sortKeysBy(obj, reference) {
    const result = {};
    for (const key in reference) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    for (const key in obj) {
        if (result[key] === undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * Format a MapLibre Style.  Returns a stringified style with its keys
 * sorted in the same order as the reference style.
 *
 * The optional `space` argument is passed to
 * [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
 * to generate formatted output.
 *
 * If `space` is unspecified, a default of `2` spaces will be used.
 *
 * The optional `maxLength` argument sets the maximum line length of the output.
 * Objects and arrays that fit within it are kept on a single line.
 * If `maxLength` is unspecified, a default of `80` characters will be used.
 *
 * @private
 * @param {Object} style a MapLibre Style
 * @param {number} [space] space argument to pass to `JSON.stringify`
 * @param {number} [maxLength] maximum line length of the output
 * @returns {string} stringified formatted JSON
 * @example
 * var fs = require('fs');
 * var format = require('maplibre-gl-style-spec').format;
 * var style = fs.readFileSync('./source.json', 'utf8');
 * fs.writeFileSync('./dest.json', format(style));
 * fs.writeFileSync('./dest.min.json', format(style, 0));
 */
export function format(style, space = 2, maxLength = 80) {
    style = sortKeysBy(style, latest.$root);

    if (style.layers) {
        style.layers = style.layers.map((layer) => sortKeysBy(layer, latest.layer));
    }

    return stringifyPretty(style, {indent: space, maxLength});
}

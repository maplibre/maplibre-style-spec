import type { StyleSpecification } from './types.g';
/**
 * Migrate a Mapbox GL Style to the latest version.
 *
 * @private
 * @alias migrate
 * @param {StyleSpecification} style a MapLibre GL Style
 * @returns {StyleSpecification} a migrated style
 * @example
 * var fs = require('fs');
 * var migrate = require('maplibre-gl-style-spec').migrate;
 * var style = fs.readFileSync('./style.json', 'utf8');
 * fs.writeFileSync('./style.json', JSON.stringify(migrate(style)));
 */
export default function migrate(style: StyleSpecification): StyleSpecification;

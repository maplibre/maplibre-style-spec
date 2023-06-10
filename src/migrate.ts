
import migrateToV8 from './migrate/v8';
import migrateToExpressions from './migrate/expressions';
import migrateColors from './migrate/migrate_colors';
import {eachProperty} from './visit';
import type {StyleSpecification} from './types.g';

/**
 * Migrate a Mapbox GL Style to the latest version.
 *
 * @private
 * @alias migrate
 * @param {StyleSpecification} style a MapLibre Style
 * @returns {StyleSpecification} a migrated style
 * @example
 * var fs = require('fs');
 * var migrate = require('maplibre-gl-style-spec').migrate;
 * var style = fs.readFileSync('./style.json', 'utf8');
 * fs.writeFileSync('./style.json', JSON.stringify(migrate(style)));
 */
export default function migrate(style: StyleSpecification): StyleSpecification {
    let migrated = false;

    if (style.version as any === 7) {
        style = migrateToV8(style);
        migrated = true;
    }

    if (style.version === 8) {
        migrated = !!migrateToExpressions(style);
        migrated = true;
    }

    eachProperty(style, {paint: true, layout: true}, ({value, reference, set}) => {
        if (reference.type === 'color') {
            set(migrateColors(value));
        }
    });

    if (!migrated) {
        throw new Error(`Cannot migrate from ${style.version}`);
    }

    return style;
}


import migrateToV8 from './migrate/v8';
import migrateToExpressions from './migrate/expressions';
import migrateColors from './migrate/migrate_colors';
import {eachProperty} from './visit';
import type {StyleSpecification} from './types.g';

/**
 * Migrate a Mapbox/MapLibre GL Style to the latest version.
 *
 * @param style - a MapLibre Style
 * @returns a migrated style
 * @example
 * const fs = require('fs');
 * const migrate = require('@maplibre/maplibre-gl-style-spec').migrate;
 * const style = fs.readFileSync('./style.json', 'utf8');
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

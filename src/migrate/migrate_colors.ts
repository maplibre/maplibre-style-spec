/**
 * Migrate color style values to supported format.
 *
 * @param colorToMigrate Color value to migrate, could be a string or an expression.
 * @returns Color style value in supported format.
 */
export default function migrateColors<T>(colorToMigrate: T): T {
    return JSON.parse(migrateHslColors(JSON.stringify(colorToMigrate)));
}

/**
 * Created to migrate from colors supported by the former CSS color parsing
 * library `csscolorparser` but not compliant with the CSS Color specification,
 * like `hsl(900, 0.15, 90%)`.
 *
 * @param colorToMigrate Serialized color style value.
 * @returns A serialized color style value in which all non-standard hsl color values
 * have been converted to a format that complies with the CSS Color specification.
 *
 * @example
 * migrateHslColors('"hsl(900, 0.15, 90%)"'); // returns '"hsl(900, 15%, 90%)"'
 * migrateHslColors('"hsla(900, .15, .9)"'); // returns '"hsl(900, 15%, 90%)"'
 * migrateHslColors('"hsl(900, 15%, 90%)"'); // returns '"hsl(900, 15%, 90%)"' - no changes
 */
function migrateHslColors(colorToMigrate: string): string {
    return colorToMigrate.replace(/"hsla?\((.+?)\)"/gi, (match, hslArgs) => {
        const argsMatch = hslArgs.match(/^(.+?)\s*,\s*(.+?)\s*,\s*(.+?)(?:\s*,\s*(.+))?$/i);
        if (argsMatch) {
            let [h, s, l, a] = argsMatch.slice(1);
            [s, l] = [s, l].map(v => v.endsWith('%') ? v : `${parseFloat(v) * 100}%`);
            return `"hsl${typeof a === 'string' ? 'a' : ''}(${[h, s, l, a].filter(Boolean).join(',')})"`;
        }
        return match;
    });
}

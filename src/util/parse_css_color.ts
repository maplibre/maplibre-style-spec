import {HSLColor, hslToRgb, RGBColor} from './color_spaces';

/**
 * CSS color parser compliant with CSS Color 4 Specification.
 * Supports: named colors, `transparent` keyword, all rgb hex notations,
 * rgb(), rgba(), hsl() and hsla() functions.
 * Does not round the parsed values to integers from the range 0..255.
 *
 * Syntax:
 *
 * <alpha-value> = <number> | <percentage>
 *         <hue> = <number> | <angle>
 *
 *         rgb() = rgb( <percentage>{3} [ / <alpha-value> ]? ) | rgb( <number>{3} [ / <alpha-value> ]? )
 *         rgb() = rgb( <percentage>#{3} , <alpha-value>? )    | rgb( <number>#{3} , <alpha-value>? )
 *
 *         hsl() = hsl( <hue> <percentage> <percentage> [ / <alpha-value> ]? )
 *         hsl() = hsl( <hue>, <percentage>, <percentage>, <alpha-value>? )
 *
 * Caveats:
 *   - <angle> - <number> with optional `deg` suffix; `grad`, `rad`, `turn` are not supported
 *   - `none` keyword is not supported
 *   - comments inside rgb()/hsl() are not supported
 *   - legacy color syntax rgba() is supported with an identical grammar and behavior to rgb()
 *   - legacy color syntax hsla() is supported with an identical grammar and behavior to hsl()
 *
 * @param input CSS color string to parse.
 * @returns Color in sRGB color space, with `red`, `green`, `blue`
 * and `alpha` channels normalized to the range 0..1,
 * or `undefined` if the input is not a valid color string.
 */
export function parseCssColor(input: string): RGBColor | undefined {
    input = input.toLowerCase();

    if (input === 'transparent') {
        return [0, 0, 0, 0];
    }

    // 'white', 'black', 'blue'
    const matchingNamedColor = namedColors.get(input);
    if (matchingNamedColor) {
        return [...matchingNamedColor, 1];
    }

    // #f0c, #f0cf, #ff00cc, #ff00ccff
    const hexRegexp = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
    if (hexRegexp.test(input)) {
        const step = input.length < 6 ? 1 : 2;
        let i = 1;
        return [ // eslint-disable-line no-return-assign
            parseHex(input.slice(i, i += step)),
            parseHex(input.slice(i, i += step)),
            parseHex(input.slice(i, i += step)),
            parseHex(input.slice(i, i + step) || 'ff'),
        ];
    }

    // rgb(128 0 0), rgb(50% 0% 0%), rgba(255,0,255,0.6), rgb(255 0 255 / 60%), rgb(100% 0% 100% /.6)
    const rgbRegExp = /^rgba?\(\s*([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/;
    const rgbMatch = input.match(rgbRegExp);
    if (rgbMatch) {
        const [
            _,  // eslint-disable-line @typescript-eslint/no-unused-vars
            r,  // <numeric>
            rp, // %         (optional)
            f1, // ,         (optional)
            g,  // <numeric>
            gp, // %         (optional)
            f2, // ,         (optional)
            b,  // <numeric>
            bp, // %         (optional)
            f3, // ,|/       (optional)
            a,  // <numeric> (optional)
            ap, // %         (optional)
        ] = rgbMatch;

        const argFormat = [f1 || ' ', f2 || ' ', f3].join('');
        if (
            argFormat === '  ' ||
            argFormat === '  /' ||
            argFormat === ',,' ||
            argFormat === ',,,'
        ) {
            const valFormat = [rp, gp, bp].join('');
            const maxValue =
                (valFormat === '%%%') ? 100 :
                    (valFormat === '') ? 255 : 0;
            if (maxValue) {
                const rgba: RGBColor = [
                    clamp(+r / maxValue, 0, 1),
                    clamp(+g / maxValue, 0, 1),
                    clamp(+b / maxValue, 0, 1),
                    a ? parseAlpha(+a, ap) : 1,
                ];
                if (validateNumbers(rgba)) {
                    return rgba;
                }
                // invalid numbers
            }
            // values must be all numbers or all percentages
        }
        return; // comma optional syntax requires no commas at all
    }

    // hsl(120 50% 80%), hsla(120deg,50%,80%,.9), hsl(12e1 50% 80% / 90%)
    const hslRegExp = /^hsla?\(\s*([\de.+-]+)(?:deg)?(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/;
    const hslMatch = input.match(hslRegExp);
    if (hslMatch) {
        const [
            _,  // eslint-disable-line @typescript-eslint/no-unused-vars
            h,  // <numeric>
            f1, // ,         (optional)
            s,  // <numeric>
            f2, // ,         (optional)
            l,  // <numeric>
            f3, // ,|/       (optional)
            a,  // <numeric> (optional)
            ap, // %         (optional)
        ] = hslMatch;

        const argFormat = [f1 || ' ', f2 || ' ', f3].join('');
        if (
            argFormat === '  ' ||
            argFormat === '  /' ||
            argFormat === ',,' ||
            argFormat === ',,,'
        ) {
            const hsla: HSLColor = [
                +h,
                clamp(+s, 0, 100),
                clamp(+l, 0, 100),
                a ? parseAlpha(+a, ap) : 1,
            ];
            if (validateNumbers(hsla)) {
                return hslToRgb(hsla);
            }
            // invalid numbers
        }
        // comma optional syntax requires no commas at all
    }
}

function parseHex(hex: string): number {
    return parseInt(hex.padEnd(2, hex), 16) / 255;
}

function parseAlpha(a: number, asPercentage: string | undefined): number {
    return clamp(asPercentage ? (a / 100) : a, 0, 1);
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(min, n), max);
}

/**
 * The regular expression for numeric values is not super specific, and it may
 * happen that it will accept a value that is not a valid number. In order to
 * detect and eliminate such values this function exists.
 *
 * @param array Array of uncertain numbers.
 * @returns `true` if the specified array contains only valid numbers, `false` otherwise.
 */
function validateNumbers(array: number[]): boolean {
    return !array.some(Number.isNaN);
}

/**
 * To generate entries:
 * - visit {@link https://www.w3.org/TR/css-color-4/#named-colors}
 * - run in the console:
 * @example
 * {
 *     const gcd = (a,b) => !b ? a : gcd(b, a % b);
 *     const formatRGB = (asInt) => {
 *         const asFloat = asInt / 255;
 *         if (`${asFloat}`.length < 7) return `${asFloat}`;
 *         const cd = gcd(asInt, 255);
 *         return `${asInt / cd} / ${255 / cd}`;
 *     };
 *     const entries = [...document.querySelector('.named-color-table tbody').children]
 *         .map((tr) => [tr.cells[2].textContent.trim(), tr.cells[4].textContent.trim().split(/\s+/)])
 *         .map(([name, rgb]) => `['${name}', [${rgb.map(formatRGB).join(', ')}]],`)
 *         .join('\n');
 *     copy(`[\n${entries}\n]`);
 * }
 */
const namedColors = new Map<string, [number, number, number]>([
    ['aliceblue', [16 / 17, 248 / 255, 1]],
    ['antiquewhite', [50 / 51, 47 / 51, 43 / 51]],
    ['aqua', [0, 1, 1]],
    ['aquamarine', [127 / 255, 1, 212 / 255]],
    ['azure', [16 / 17, 1, 1]],
    ['beige', [49 / 51, 49 / 51, 44 / 51]],
    ['bisque', [1, 76 / 85, 196 / 255]],
    ['black', [0, 0, 0]],
    ['blanchedalmond', [1, 47 / 51, 41 / 51]],
    ['blue', [0, 0, 1]],
    ['blueviolet', [46 / 85, 43 / 255, 226 / 255]],
    ['brown', [11 / 17, 14 / 85, 14 / 85]],
    ['burlywood', [74 / 85, 184 / 255, 9 / 17]],
    ['cadetblue', [19 / 51, 158 / 255, 32 / 51]],
    ['chartreuse', [127 / 255, 1, 0]],
    ['chocolate', [14 / 17, 7 / 17, 2 / 17]],
    ['coral', [1, 127 / 255, 16 / 51]],
    ['cornflowerblue', [20 / 51, 149 / 255, 79 / 85]],
    ['cornsilk', [1, 248 / 255, 44 / 51]],
    ['crimson', [44 / 51, 4 / 51, 4 / 17]],
    ['cyan', [0, 1, 1]],
    ['darkblue', [0, 0, 139 / 255]],
    ['darkcyan', [0, 139 / 255, 139 / 255]],
    ['darkgoldenrod', [184 / 255, 134 / 255, 11 / 255]],
    ['darkgray', [169 / 255, 169 / 255, 169 / 255]],
    ['darkgreen', [0, 20 / 51, 0]],
    ['darkgrey', [169 / 255, 169 / 255, 169 / 255]],
    ['darkkhaki', [63 / 85, 61 / 85, 107 / 255]],
    ['darkmagenta', [139 / 255, 0, 139 / 255]],
    ['darkolivegreen', [1 / 3, 107 / 255, 47 / 255]],
    ['darkorange', [1, 28 / 51, 0]],
    ['darkorchid', [0.6, 10 / 51, 0.8]],
    ['darkred', [139 / 255, 0, 0]],
    ['darksalmon', [233 / 255, 10 / 17, 122 / 255]],
    ['darkseagreen', [143 / 255, 188 / 255, 143 / 255]],
    ['darkslateblue', [24 / 85, 61 / 255, 139 / 255]],
    ['darkslategray', [47 / 255, 79 / 255, 79 / 255]],
    ['darkslategrey', [47 / 255, 79 / 255, 79 / 255]],
    ['darkturquoise', [0, 206 / 255, 209 / 255]],
    ['darkviolet', [148 / 255, 0, 211 / 255]],
    ['deeppink', [1, 4 / 51, 49 / 85]],
    ['deepskyblue', [0, 191 / 255, 1]],
    ['dimgray', [7 / 17, 7 / 17, 7 / 17]],
    ['dimgrey', [7 / 17, 7 / 17, 7 / 17]],
    ['dodgerblue', [2 / 17, 48 / 85, 1]],
    ['firebrick', [178 / 255, 2 / 15, 2 / 15]],
    ['floralwhite', [1, 50 / 51, 16 / 17]],
    ['forestgreen', [2 / 15, 139 / 255, 2 / 15]],
    ['fuchsia', [1, 0, 1]],
    ['gainsboro', [44 / 51, 44 / 51, 44 / 51]],
    ['ghostwhite', [248 / 255, 248 / 255, 1]],
    ['gold', [1, 43 / 51, 0]],
    ['goldenrod', [218 / 255, 11 / 17, 32 / 255]],
    ['gray', [128 / 255, 128 / 255, 128 / 255]],
    ['green', [0, 128 / 255, 0]],
    ['greenyellow', [173 / 255, 1, 47 / 255]],
    ['grey', [128 / 255, 128 / 255, 128 / 255]],
    ['honeydew', [16 / 17, 1, 16 / 17]],
    ['hotpink', [1, 7 / 17, 12 / 17]],
    ['indianred', [41 / 51, 92 / 255, 92 / 255]],
    ['indigo', [5 / 17, 0, 26 / 51]],
    ['ivory', [1, 1, 16 / 17]],
    ['khaki', [16 / 17, 46 / 51, 28 / 51]],
    ['lavender', [46 / 51, 46 / 51, 50 / 51]],
    ['lavenderblush', [1, 16 / 17, 49 / 51]],
    ['lawngreen', [124 / 255, 84 / 85, 0]],
    ['lemonchiffon', [1, 50 / 51, 41 / 51]],
    ['lightblue', [173 / 255, 72 / 85, 46 / 51]],
    ['lightcoral', [16 / 17, 128 / 255, 128 / 255]],
    ['lightcyan', [224 / 255, 1, 1]],
    ['lightgoldenrodyellow', [50 / 51, 50 / 51, 14 / 17]],
    ['lightgray', [211 / 255, 211 / 255, 211 / 255]],
    ['lightgreen', [48 / 85, 14 / 15, 48 / 85]],
    ['lightgrey', [211 / 255, 211 / 255, 211 / 255]],
    ['lightpink', [1, 182 / 255, 193 / 255]],
    ['lightsalmon', [1, 32 / 51, 122 / 255]],
    ['lightseagreen', [32 / 255, 178 / 255, 2 / 3]],
    ['lightskyblue', [9 / 17, 206 / 255, 50 / 51]],
    ['lightslategray', [7 / 15, 8 / 15, 0.6]],
    ['lightslategrey', [7 / 15, 8 / 15, 0.6]],
    ['lightsteelblue', [176 / 255, 196 / 255, 74 / 85]],
    ['lightyellow', [1, 1, 224 / 255]],
    ['lime', [0, 1, 0]],
    ['limegreen', [10 / 51, 41 / 51, 10 / 51]],
    ['linen', [50 / 51, 16 / 17, 46 / 51]],
    ['magenta', [1, 0, 1]],
    ['maroon', [128 / 255, 0, 0]],
    ['mediumaquamarine', [0.4, 41 / 51, 2 / 3]],
    ['mediumblue', [0, 0, 41 / 51]],
    ['mediumorchid', [62 / 85, 1 / 3, 211 / 255]],
    ['mediumpurple', [49 / 85, 112 / 255, 73 / 85]],
    ['mediumseagreen', [4 / 17, 179 / 255, 113 / 255]],
    ['mediumslateblue', [41 / 85, 104 / 255, 14 / 15]],
    ['mediumspringgreen', [0, 50 / 51, 154 / 255]],
    ['mediumturquoise', [24 / 85, 209 / 255, 0.8]],
    ['mediumvioletred', [199 / 255, 7 / 85, 133 / 255]],
    ['midnightblue', [5 / 51, 5 / 51, 112 / 255]],
    ['mintcream', [49 / 51, 1, 50 / 51]],
    ['mistyrose', [1, 76 / 85, 15 / 17]],
    ['moccasin', [1, 76 / 85, 181 / 255]],
    ['navajowhite', [1, 74 / 85, 173 / 255]],
    ['navy', [0, 0, 128 / 255]],
    ['oldlace', [253 / 255, 49 / 51, 46 / 51]],
    ['olive', [128 / 255, 128 / 255, 0]],
    ['olivedrab', [107 / 255, 142 / 255, 7 / 51]],
    ['orange', [1, 11 / 17, 0]],
    ['orangered', [1, 23 / 85, 0]],
    ['orchid', [218 / 255, 112 / 255, 214 / 255]],
    ['palegoldenrod', [14 / 15, 232 / 255, 2 / 3]],
    ['palegreen', [152 / 255, 251 / 255, 152 / 255]],
    ['paleturquoise', [35 / 51, 14 / 15, 14 / 15]],
    ['palevioletred', [73 / 85, 112 / 255, 49 / 85]],
    ['papayawhip', [1, 239 / 255, 71 / 85]],
    ['peachpuff', [1, 218 / 255, 37 / 51]],
    ['peru', [41 / 51, 133 / 255, 21 / 85]],
    ['pink', [1, 64 / 85, 203 / 255]],
    ['plum', [13 / 15, 32 / 51, 13 / 15]],
    ['powderblue', [176 / 255, 224 / 255, 46 / 51]],
    ['purple', [128 / 255, 0, 128 / 255]],
    ['rebeccapurple', [0.4, 0.2, 0.6]],
    ['red', [1, 0, 0]],
    ['rosybrown', [188 / 255, 143 / 255, 143 / 255]],
    ['royalblue', [13 / 51, 7 / 17, 15 / 17]],
    ['saddlebrown', [139 / 255, 23 / 85, 19 / 255]],
    ['salmon', [50 / 51, 128 / 255, 38 / 85]],
    ['sandybrown', [244 / 255, 164 / 255, 32 / 85]],
    ['seagreen', [46 / 255, 139 / 255, 29 / 85]],
    ['seashell', [1, 49 / 51, 14 / 15]],
    ['sienna', [32 / 51, 82 / 255, 3 / 17]],
    ['silver', [64 / 85, 64 / 85, 64 / 85]],
    ['skyblue', [9 / 17, 206 / 255, 47 / 51]],
    ['slateblue', [106 / 255, 6 / 17, 41 / 51]],
    ['slategray', [112 / 255, 128 / 255, 48 / 85]],
    ['slategrey', [112 / 255, 128 / 255, 48 / 85]],
    ['snow', [1, 50 / 51, 50 / 51]],
    ['springgreen', [0, 1, 127 / 255]],
    ['steelblue', [14 / 51, 26 / 51, 12 / 17]],
    ['tan', [14 / 17, 12 / 17, 28 / 51]],
    ['teal', [0, 128 / 255, 128 / 255]],
    ['thistle', [72 / 85, 191 / 255, 72 / 85]],
    ['tomato', [1, 33 / 85, 71 / 255]],
    ['turquoise', [64 / 255, 224 / 255, 208 / 255]],
    ['violet', [14 / 15, 26 / 51, 14 / 15]],
    ['wheat', [49 / 51, 74 / 85, 179 / 255]],
    ['white', [1, 1, 1]],
    ['whitesmoke', [49 / 51, 49 / 51, 49 / 51]],
    ['yellow', [1, 1, 0]],
    ['yellowgreen', [154 / 255, 41 / 51, 10 / 51]],
]);

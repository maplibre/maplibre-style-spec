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
    input = input.toLowerCase().trim();

    if (input === 'transparent') {
        return [0, 0, 0, 0];
    }

    // 'white', 'black', 'blue'
    const namedColorsMatch = namedColors[input];
    if (namedColorsMatch) {
        const [r, g, b] = namedColorsMatch;
        return [r / 255, g / 255, b / 255, 1];
    }

    // #f0c, #f0cf, #ff00cc, #ff00ccff
    if (input.startsWith('#')) {
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
    }

    // rgb(128 0 0), rgb(50% 0% 0%), rgba(255,0,255,0.6), rgb(255 0 255 / 60%), rgb(100% 0% 100% /.6)
    if (input.startsWith('rgb')) {
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
 * To generate:
 * - visit {@link https://www.w3.org/TR/css-color-4/#named-colors}
 * - run in the console:
 * @example
 * copy(`{\n${[...document.querySelector('.named-color-table tbody').children].map((tr) => `${tr.cells[2].textContent.trim()}: [${tr.cells[4].textContent.trim().split(/\s+/).join(', ')}],`).join('\n')}\n}`);
 */
const namedColors: Record<string, [number, number, number]> = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50],
};

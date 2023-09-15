#!/usr/bin/env node
import minimist from 'minimist';
import rw from 'rw';
import UnitBezier from '@mapbox/unitbezier';
import jsonlint from '@mapbox/jsonlint-lines-primitives';

// Note: Do not inherit from Error. It breaks when transpiling to ES5.
class ValidationError {
    constructor(key, value, message, identifier) {
        this.message = (key ? `${key}: ` : '') + message;
        if (identifier)
            this.identifier = identifier;
        if (value !== null && value !== undefined && value.__line__) {
            this.line = value.__line__;
        }
    }
}

function validateConstants(options) {
    const key = options.key;
    const constants = options.value;
    if (constants) {
        return [new ValidationError(key, constants, 'constants have been deprecated as of v8')];
    }
    else {
        return [];
    }
}

function extendBy(output, ...inputs) {
    for (const input of inputs) {
        for (const k in input) {
            output[k] = input[k];
        }
    }
    return output;
}

// Turn jsonlint-lines-primitives objects into primitive objects
function unbundle(value) {
    if (value instanceof Number || value instanceof String || value instanceof Boolean) {
        return value.valueOf();
    }
    else {
        return value;
    }
}
function deepUnbundle(value) {
    if (Array.isArray(value)) {
        return value.map(deepUnbundle);
    }
    else if (value instanceof Object && !(value instanceof Number || value instanceof String || value instanceof Boolean)) {
        const unbundledValue = {};
        for (const key in value) {
            unbundledValue[key] = deepUnbundle(value[key]);
        }
        return unbundledValue;
    }
    return unbundle(value);
}

class ExpressionParsingError extends Error {
    constructor(key, message) {
        super(message);
        this.message = message;
        this.key = key;
    }
}

/**
 * Tracks `let` bindings during expression parsing.
 * @private
 */
class Scope {
    constructor(parent, bindings = []) {
        this.parent = parent;
        this.bindings = {};
        for (const [name, expression] of bindings) {
            this.bindings[name] = expression;
        }
    }
    concat(bindings) {
        return new Scope(this, bindings);
    }
    get(name) {
        if (this.bindings[name]) {
            return this.bindings[name];
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`${name} not found in scope.`);
    }
    has(name) {
        if (this.bindings[name])
            return true;
        return this.parent ? this.parent.has(name) : false;
    }
}

const NullType = { kind: 'null' };
const NumberType = { kind: 'number' };
const StringType = { kind: 'string' };
const BooleanType = { kind: 'boolean' };
const ColorType = { kind: 'color' };
const ObjectType = { kind: 'object' };
const ValueType = { kind: 'value' };
const ErrorType = { kind: 'error' };
const CollatorType = { kind: 'collator' };
const FormattedType = { kind: 'formatted' };
const PaddingType = { kind: 'padding' };
const ResolvedImageType = { kind: 'resolvedImage' };
const VariableAnchorOffsetCollectionType = { kind: 'variableAnchorOffsetCollection' };
function array$1(itemType, N) {
    return {
        kind: 'array',
        itemType,
        N
    };
}
function toString$1(type) {
    if (type.kind === 'array') {
        const itemType = toString$1(type.itemType);
        return typeof type.N === 'number' ?
            `array<${itemType}, ${type.N}>` :
            type.itemType.kind === 'value' ? 'array' : `array<${itemType}>`;
    }
    else {
        return type.kind;
    }
}
const valueMemberTypes = [
    NullType,
    NumberType,
    StringType,
    BooleanType,
    ColorType,
    FormattedType,
    ObjectType,
    array$1(ValueType),
    PaddingType,
    ResolvedImageType,
    VariableAnchorOffsetCollectionType
];
/**
 * Returns null if `t` is a subtype of `expected`; otherwise returns an
 * error message.
 * @private
 */
function checkSubtype(expected, t) {
    if (t.kind === 'error') {
        // Error is a subtype of every type
        return null;
    }
    else if (expected.kind === 'array') {
        if (t.kind === 'array' &&
            ((t.N === 0 && t.itemType.kind === 'value') || !checkSubtype(expected.itemType, t.itemType)) &&
            (typeof expected.N !== 'number' || expected.N === t.N)) {
            return null;
        }
    }
    else if (expected.kind === t.kind) {
        return null;
    }
    else if (expected.kind === 'value') {
        for (const memberType of valueMemberTypes) {
            if (!checkSubtype(memberType, t)) {
                return null;
            }
        }
    }
    return `Expected ${toString$1(expected)} but found ${toString$1(t)} instead.`;
}
function isValidType(provided, allowedTypes) {
    return allowedTypes.some(t => t.kind === provided.kind);
}
function isValidNativeType(provided, allowedTypes) {
    return allowedTypes.some(t => {
        if (t === 'null') {
            return provided === null;
        }
        else if (t === 'array') {
            return Array.isArray(provided);
        }
        else if (t === 'object') {
            return provided && !Array.isArray(provided) && typeof provided === 'object';
        }
        else {
            return t === typeof provided;
        }
    });
}
/**
 * Verify whether the specified type is of the same type as the specified sample.
 *
 * @param provided Type to verify
 * @param sample Sample type to reference
 * @returns `true` if both objects are of the same type, `false` otherwise
 * @example basic types
 * if (verifyType(outputType, ValueType)) {
 *     // type narrowed to:
 *     outputType.kind; // 'value'
 * }
 * @example array types
 * if (verifyType(outputType, array(NumberType))) {
 *     // type narrowed to:
 *     outputType.kind; // 'array'
 *     outputType.itemType; // NumberTypeT
 *     outputType.itemType.kind; // 'number'
 * }
 */
function verifyType(provided, sample) {
    if (provided.kind === 'array' && sample.kind === 'array') {
        return provided.itemType.kind === sample.itemType.kind && typeof provided.N === 'number';
    }
    return provided.kind === sample.kind;
}

// See https://observablehq.com/@mbostock/lab-and-rgb
const Xn = 0.96422, Yn = 1, Zn = 0.82521, t0 = 4 / 29, t1 = 6 / 29, t2 = 3 * t1 * t1, t3 = t1 * t1 * t1, deg2rad = Math.PI / 180, rad2deg = 180 / Math.PI;
function constrainAngle(angle) {
    angle = angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
function rgbToLab([r, g, b, alpha]) {
    r = rgb2xyz(r);
    g = rgb2xyz(g);
    b = rgb2xyz(b);
    let x, z;
    const y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn);
    if (r === g && g === b) {
        x = z = y;
    }
    else {
        x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
        z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    const l = 116 * y - 16;
    return [(l < 0) ? 0 : l, 500 * (x - y), 200 * (y - z), alpha];
}
function rgb2xyz(x) {
    return (x <= 0.04045) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function xyz2lab(t) {
    return (t > t3) ? Math.pow(t, 1 / 3) : t / t2 + t0;
}
function labToRgb([l, a, b, alpha]) {
    let y = (l + 16) / 116, x = isNaN(a) ? y : y + a / 500, z = isNaN(b) ? y : y - b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return [
        xyz2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
        xyz2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
        xyz2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
        alpha,
    ];
}
function xyz2rgb(x) {
    x = (x <= 0.00304) ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return (x < 0) ? 0 : (x > 1) ? 1 : x; // clip to 0..1 range
}
function lab2xyz(t) {
    return (t > t1) ? t * t * t : t2 * (t - t0);
}
function rgbToHcl(rgbColor) {
    const [l, a, b, alpha] = rgbToLab(rgbColor);
    const c = Math.sqrt(a * a + b * b);
    const h = Math.round(c * 10000) ? constrainAngle(Math.atan2(b, a) * rad2deg) : NaN;
    return [h, c, l, alpha];
}
function hclToRgb([h, c, l, alpha]) {
    h = isNaN(h) ? 0 : h * deg2rad;
    return labToRgb([l, Math.cos(h) * c, Math.sin(h) * c, alpha]);
}
// https://drafts.csswg.org/css-color-4/#hsl-to-rgb
function hslToRgb([h, s, l, alpha]) {
    h = constrainAngle(h);
    s /= 100;
    l /= 100;
    function f(n) {
        const k = (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }
    return [f(0), f(8), f(4), alpha];
}

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
function parseCssColor(input) {
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
            return [
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
            const [_, // eslint-disable-line @typescript-eslint/no-unused-vars
            r, // <numeric>
            rp, // %         (optional)
            f1, // ,         (optional)
            g, // <numeric>
            gp, // %         (optional)
            f2, // ,         (optional)
            b, // <numeric>
            bp, // %         (optional)
            f3, // ,|/       (optional)
            a, // <numeric> (optional)
            ap, // %         (optional)
            ] = rgbMatch;
            const argFormat = [f1 || ' ', f2 || ' ', f3].join('');
            if (argFormat === '  ' ||
                argFormat === '  /' ||
                argFormat === ',,' ||
                argFormat === ',,,') {
                const valFormat = [rp, gp, bp].join('');
                const maxValue = (valFormat === '%%%') ? 100 :
                    (valFormat === '') ? 255 : 0;
                if (maxValue) {
                    const rgba = [
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
        const [_, // eslint-disable-line @typescript-eslint/no-unused-vars
        h, // <numeric>
        f1, // ,         (optional)
        s, // <numeric>
        f2, // ,         (optional)
        l, // <numeric>
        f3, // ,|/       (optional)
        a, // <numeric> (optional)
        ap, // %         (optional)
        ] = hslMatch;
        const argFormat = [f1 || ' ', f2 || ' ', f3].join('');
        if (argFormat === '  ' ||
            argFormat === '  /' ||
            argFormat === ',,' ||
            argFormat === ',,,') {
            const hsla = [
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
function parseHex(hex) {
    return parseInt(hex.padEnd(2, hex), 16) / 255;
}
function parseAlpha(a, asPercentage) {
    return clamp(asPercentage ? (a / 100) : a, 0, 1);
}
function clamp(n, min, max) {
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
function validateNumbers(array) {
    return !array.some(Number.isNaN);
}
/**
 * To generate:
 * - visit {@link https://www.w3.org/TR/css-color-4/#named-colors}
 * - run in the console:
 * @example
 * copy(`{\n${[...document.querySelector('.named-color-table tbody').children].map((tr) => `${tr.cells[2].textContent.trim()}: [${tr.cells[4].textContent.trim().split(/\s+/).join(', ')}],`).join('\n')}\n}`);
 */
const namedColors = {
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

/**
 * Color representation used by WebGL.
 * Defined in sRGB color space and pre-blended with alpha.
 * @private
 */
class Color {
    /**
     * @param r Red component premultiplied by `alpha` 0..1
     * @param g Green component premultiplied by `alpha` 0..1
     * @param b Blue component premultiplied by `alpha` 0..1
     * @param [alpha=1] Alpha component 0..1
     * @param [premultiplied=true] Whether the `r`, `g` and `b` values have already
     * been multiplied by alpha. If `true` nothing happens if `false` then they will
     * be multiplied automatically.
     */
    constructor(r, g, b, alpha = 1, premultiplied = true) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;
        if (!premultiplied) {
            this.r *= alpha;
            this.g *= alpha;
            this.b *= alpha;
            if (!alpha) {
                // alpha = 0 erases completely rgb channels. This behavior is not desirable
                // if this particular color is later used in color interpolation.
                // Because of that, a reference to original color is saved.
                this.overwriteGetter('rgb', [r, g, b, alpha]);
            }
        }
    }
    /**
     * Parses CSS color strings and converts colors to sRGB color space if needed.
     * Officially supported color formats:
     * - keyword, e.g. 'aquamarine' or 'steelblue'
     * - hex (with 3, 4, 6 or 8 digits), e.g. '#f0f' or '#e9bebea9'
     * - rgb and rgba, e.g. 'rgb(0,240,120)' or 'rgba(0%,94%,47%,0.1)' or 'rgb(0 240 120 / .3)'
     * - hsl and hsla, e.g. 'hsl(0,0%,83%)' or 'hsla(0,0%,83%,.5)' or 'hsl(0 0% 83% / 20%)'
     *
     * @param input CSS color string to parse.
     * @returns A `Color` instance, or `undefined` if the input is not a valid color string.
     */
    static parse(input) {
        // in zoom-and-property function input could be an instance of Color class
        if (input instanceof Color) {
            return input;
        }
        if (typeof input !== 'string') {
            return;
        }
        const rgba = parseCssColor(input);
        if (rgba) {
            return new Color(...rgba, false);
        }
    }
    /**
     * Used in color interpolation and by 'to-rgba' expression.
     *
     * @returns Gien color, with reversed alpha blending, in sRGB color space.
     */
    get rgb() {
        const { r, g, b, a } = this;
        const f = a || Infinity; // reverse alpha blending factor
        return this.overwriteGetter('rgb', [r / f, g / f, b / f, a]);
    }
    /**
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, in HCL color space.
     */
    get hcl() {
        return this.overwriteGetter('hcl', rgbToHcl(this.rgb));
    }
    /**
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, in LAB color space.
     */
    get lab() {
        return this.overwriteGetter('lab', rgbToLab(this.rgb));
    }
    /**
     * Lazy getter pattern. When getter is called for the first time lazy value
     * is calculated and then overwrites getter function in given object instance.
     *
     * @example:
     * const redColor = Color.parse('red');
     * let x = redColor.hcl; // this will invoke `get hcl()`, which will calculate
     * // the value of red in HCL space and invoke this `overwriteGetter` function
     * // which in turn will set a field with a key 'hcl' in the `redColor` object.
     * // In other words it will override `get hcl()` from its `Color` prototype
     * // with its own property: hcl = [calculated red value in hcl].
     * let y = redColor.hcl; // next call will no longer invoke getter but simply
     * // return the previously calculated value
     * x === y; // true - `x` is exactly the same object as `y`
     *
     * @param getterKey Getter key
     * @param lazyValue Lazily calculated value to be memoized by current instance
     * @private
     */
    overwriteGetter(getterKey, lazyValue) {
        Object.defineProperty(this, getterKey, { value: lazyValue });
        return lazyValue;
    }
    /**
     * Used by 'to-string' expression.
     *
     * @returns Serialized color in format `rgba(r,g,b,a)`
     * where r,g,b are numbers within 0..255 and alpha is number within 1..0
     *
     * @example
     * var purple = new Color.parse('purple');
     * purple.toString; // = "rgba(128,0,128,1)"
     * var translucentGreen = new Color.parse('rgba(26, 207, 26, .73)');
     * translucentGreen.toString(); // = "rgba(26,207,26,0.73)"
     */
    toString() {
        const [r, g, b, a] = this.rgb;
        return `rgba(${[r, g, b].map(n => Math.round(n * 255)).join(',')},${a})`;
    }
}
Color.black = new Color(0, 0, 0, 1);
Color.white = new Color(1, 1, 1, 1);
Color.transparent = new Color(0, 0, 0, 0);
Color.red = new Color(1, 0, 0, 1);

// Flow type declarations for Intl cribbed from
// https://github.com/facebook/flow/issues/1270
class Collator {
    constructor(caseSensitive, diacriticSensitive, locale) {
        if (caseSensitive)
            this.sensitivity = diacriticSensitive ? 'variant' : 'case';
        else
            this.sensitivity = diacriticSensitive ? 'accent' : 'base';
        this.locale = locale;
        this.collator = new Intl.Collator(this.locale ? this.locale : [], { sensitivity: this.sensitivity, usage: 'search' });
    }
    compare(lhs, rhs) {
        return this.collator.compare(lhs, rhs);
    }
    resolvedLocale() {
        // We create a Collator without "usage: search" because we don't want
        // the search options encoded in our result (e.g. "en-u-co-search")
        return new Intl.Collator(this.locale ? this.locale : [])
            .resolvedOptions().locale;
    }
}

class FormattedSection {
    constructor(text, image, scale, fontStack, textColor) {
        this.text = text;
        this.image = image;
        this.scale = scale;
        this.fontStack = fontStack;
        this.textColor = textColor;
    }
}
class Formatted {
    constructor(sections) {
        this.sections = sections;
    }
    static fromString(unformatted) {
        return new Formatted([new FormattedSection(unformatted, null, null, null, null)]);
    }
    isEmpty() {
        if (this.sections.length === 0)
            return true;
        return !this.sections.some(section => section.text.length !== 0 ||
            (section.image && section.image.name.length !== 0));
    }
    static factory(text) {
        if (text instanceof Formatted) {
            return text;
        }
        else {
            return Formatted.fromString(text);
        }
    }
    toString() {
        if (this.sections.length === 0)
            return '';
        return this.sections.map(section => section.text).join('');
    }
}

/**
 * A set of four numbers representing padding around a box. Create instances from
 * bare arrays or numeric values using the static method `Padding.parse`.
 * @private
 */
class Padding {
    constructor(values) {
        this.values = values.slice();
    }
    /**
     * Numeric padding values
     * @param input A padding value
     * @returns A `Padding` instance, or `undefined` if the input is not a valid padding value.
     */
    static parse(input) {
        if (input instanceof Padding) {
            return input;
        }
        // Backwards compatibility: bare number is treated the same as array with single value.
        // Padding applies to all four sides.
        if (typeof input === 'number') {
            return new Padding([input, input, input, input]);
        }
        if (!Array.isArray(input)) {
            return undefined;
        }
        if (input.length < 1 || input.length > 4) {
            return undefined;
        }
        for (const val of input) {
            if (typeof val !== 'number') {
                return undefined;
            }
        }
        // Expand shortcut properties into explicit 4-sided values
        switch (input.length) {
            case 1:
                input = [input[0], input[0], input[0], input[0]];
                break;
            case 2:
                input = [input[0], input[1], input[0], input[1]];
                break;
            case 3:
                input = [input[0], input[1], input[2], input[1]];
                break;
        }
        return new Padding(input);
    }
    toString() {
        return JSON.stringify(this.values);
    }
}

/** Set of valid anchor positions, as a set for validation */
const anchors = new Set(['center', 'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']);
/**
 * Utility class to assist managing values for text-variable-anchor-offset property. Create instances from
 * bare arrays using the static method `VariableAnchorOffsetCollection.parse`.
 * @private
 */
class VariableAnchorOffsetCollection {
    constructor(values) {
        this.values = values.slice();
    }
    static parse(input) {
        if (input instanceof VariableAnchorOffsetCollection) {
            return input;
        }
        if (!Array.isArray(input) ||
            input.length < 1 ||
            input.length % 2 !== 0) {
            return undefined;
        }
        for (let i = 0; i < input.length; i += 2) {
            // Elements in even positions should be anchor positions; Elements in odd positions should be offset values
            const anchorValue = input[i];
            const offsetValue = input[i + 1];
            if (typeof anchorValue !== 'string' || !anchors.has(anchorValue)) {
                return undefined;
            }
            if (!Array.isArray(offsetValue) || offsetValue.length !== 2 || typeof offsetValue[0] !== 'number' || typeof offsetValue[1] !== 'number') {
                return undefined;
            }
        }
        return new VariableAnchorOffsetCollection(input);
    }
    toString() {
        return JSON.stringify(this.values);
    }
}

class ResolvedImage {
    constructor(options) {
        this.name = options.name;
        this.available = options.available;
    }
    toString() {
        return this.name;
    }
    static fromString(name) {
        if (!name)
            return null; // treat empty values as no image
        return new ResolvedImage({ name, available: false });
    }
}

function validateRGBA(r, g, b, a) {
    if (!(typeof r === 'number' && r >= 0 && r <= 255 &&
        typeof g === 'number' && g >= 0 && g <= 255 &&
        typeof b === 'number' && b >= 0 && b <= 255)) {
        const value = typeof a === 'number' ? [r, g, b, a] : [r, g, b];
        return `Invalid rgba value [${value.join(', ')}]: 'r', 'g', and 'b' must be between 0 and 255.`;
    }
    if (!(typeof a === 'undefined' || (typeof a === 'number' && a >= 0 && a <= 1))) {
        return `Invalid rgba value [${[r, g, b, a].join(', ')}]: 'a' must be between 0 and 1.`;
    }
    return null;
}
function isValue(mixed) {
    if (mixed === null ||
        typeof mixed === 'string' ||
        typeof mixed === 'boolean' ||
        typeof mixed === 'number' ||
        mixed instanceof Color ||
        mixed instanceof Collator ||
        mixed instanceof Formatted ||
        mixed instanceof Padding ||
        mixed instanceof VariableAnchorOffsetCollection ||
        mixed instanceof ResolvedImage) {
        return true;
    }
    else if (Array.isArray(mixed)) {
        for (const item of mixed) {
            if (!isValue(item)) {
                return false;
            }
        }
        return true;
    }
    else if (typeof mixed === 'object') {
        for (const key in mixed) {
            if (!isValue(mixed[key])) {
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}
function typeOf(value) {
    if (value === null) {
        return NullType;
    }
    else if (typeof value === 'string') {
        return StringType;
    }
    else if (typeof value === 'boolean') {
        return BooleanType;
    }
    else if (typeof value === 'number') {
        return NumberType;
    }
    else if (value instanceof Color) {
        return ColorType;
    }
    else if (value instanceof Collator) {
        return CollatorType;
    }
    else if (value instanceof Formatted) {
        return FormattedType;
    }
    else if (value instanceof Padding) {
        return PaddingType;
    }
    else if (value instanceof VariableAnchorOffsetCollection) {
        return VariableAnchorOffsetCollectionType;
    }
    else if (value instanceof ResolvedImage) {
        return ResolvedImageType;
    }
    else if (Array.isArray(value)) {
        const length = value.length;
        let itemType;
        for (const item of value) {
            const t = typeOf(item);
            if (!itemType) {
                itemType = t;
            }
            else if (itemType === t) {
                continue;
            }
            else {
                itemType = ValueType;
                break;
            }
        }
        return array$1(itemType || ValueType, length);
    }
    else {
        return ObjectType;
    }
}
function toString(value) {
    const type = typeof value;
    if (value === null) {
        return '';
    }
    else if (type === 'string' || type === 'number' || type === 'boolean') {
        return String(value);
    }
    else if (value instanceof Color || value instanceof Formatted || value instanceof Padding || value instanceof VariableAnchorOffsetCollection || value instanceof ResolvedImage) {
        return value.toString();
    }
    else {
        return JSON.stringify(value);
    }
}

class Literal {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static parse(args, context) {
        if (args.length !== 2)
            return context.error(`'literal' expression requires exactly one argument, but found ${args.length - 1} instead.`);
        if (!isValue(args[1]))
            return context.error('invalid value');
        const value = args[1];
        let type = typeOf(value);
        // special case: infer the item type if possible for zero-length arrays
        const expected = context.expectedType;
        if (type.kind === 'array' &&
            type.N === 0 &&
            expected &&
            expected.kind === 'array' &&
            (typeof expected.N !== 'number' || expected.N === 0)) {
            type = expected;
        }
        return new Literal(type, value);
    }
    evaluate() {
        return this.value;
    }
    eachChild() { }
    outputDefined() {
        return true;
    }
}

class RuntimeError {
    constructor(message) {
        this.name = 'ExpressionEvaluationError';
        this.message = message;
    }
    toJSON() {
        return this.message;
    }
}

const types$1 = {
    string: StringType,
    number: NumberType,
    boolean: BooleanType,
    object: ObjectType
};
class Assertion {
    constructor(type, args) {
        this.type = type;
        this.args = args;
    }
    static parse(args, context) {
        if (args.length < 2)
            return context.error('Expected at least one argument.');
        let i = 1;
        let type;
        const name = args[0];
        if (name === 'array') {
            let itemType;
            if (args.length > 2) {
                const type = args[1];
                if (typeof type !== 'string' || !(type in types$1) || type === 'object')
                    return context.error('The item type argument of "array" must be one of string, number, boolean', 1);
                itemType = types$1[type];
                i++;
            }
            else {
                itemType = ValueType;
            }
            let N;
            if (args.length > 3) {
                if (args[2] !== null &&
                    (typeof args[2] !== 'number' ||
                        args[2] < 0 ||
                        args[2] !== Math.floor(args[2]))) {
                    return context.error('The length argument to "array" must be a positive integer literal', 2);
                }
                N = args[2];
                i++;
            }
            type = array$1(itemType, N);
        }
        else {
            if (!types$1[name])
                throw new Error(`Types doesn't contain name = ${name}`);
            type = types$1[name];
        }
        const parsed = [];
        for (; i < args.length; i++) {
            const input = context.parse(args[i], i, ValueType);
            if (!input)
                return null;
            parsed.push(input);
        }
        return new Assertion(type, parsed);
    }
    evaluate(ctx) {
        for (let i = 0; i < this.args.length; i++) {
            const value = this.args[i].evaluate(ctx);
            const error = checkSubtype(this.type, typeOf(value));
            if (!error) {
                return value;
            }
            else if (i === this.args.length - 1) {
                throw new RuntimeError(`Expected value to be of type ${toString$1(this.type)}, but found ${toString$1(typeOf(value))} instead.`);
            }
        }
        throw new Error();
    }
    eachChild(fn) {
        this.args.forEach(fn);
    }
    outputDefined() {
        return this.args.every(arg => arg.outputDefined());
    }
}

const types = {
    'to-boolean': BooleanType,
    'to-color': ColorType,
    'to-number': NumberType,
    'to-string': StringType
};
/**
 * Special form for error-coalescing coercion expressions "to-number",
 * "to-color".  Since these coercions can fail at runtime, they accept multiple
 * arguments, only evaluating one at a time until one succeeds.
 *
 * @private
 */
class Coercion {
    constructor(type, args) {
        this.type = type;
        this.args = args;
    }
    static parse(args, context) {
        if (args.length < 2)
            return context.error('Expected at least one argument.');
        const name = args[0];
        if (!types[name])
            throw new Error(`Can't parse ${name} as it is not part of the known types`);
        if ((name === 'to-boolean' || name === 'to-string') && args.length !== 2)
            return context.error('Expected one argument.');
        const type = types[name];
        const parsed = [];
        for (let i = 1; i < args.length; i++) {
            const input = context.parse(args[i], i, ValueType);
            if (!input)
                return null;
            parsed.push(input);
        }
        return new Coercion(type, parsed);
    }
    evaluate(ctx) {
        switch (this.type.kind) {
            case 'boolean':
                return Boolean(this.args[0].evaluate(ctx));
            case 'color': {
                let input;
                let error;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);
                    error = null;
                    if (input instanceof Color) {
                        return input;
                    }
                    else if (typeof input === 'string') {
                        const c = ctx.parseColor(input);
                        if (c)
                            return c;
                    }
                    else if (Array.isArray(input)) {
                        if (input.length < 3 || input.length > 4) {
                            error = `Invalid rbga value ${JSON.stringify(input)}: expected an array containing either three or four numeric values.`;
                        }
                        else {
                            error = validateRGBA(input[0], input[1], input[2], input[3]);
                        }
                        if (!error) {
                            return new Color(input[0] / 255, input[1] / 255, input[2] / 255, input[3]);
                        }
                    }
                }
                throw new RuntimeError(error || `Could not parse color from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'padding': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);
                    const pad = Padding.parse(input);
                    if (pad) {
                        return pad;
                    }
                }
                throw new RuntimeError(`Could not parse padding from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'variableAnchorOffsetCollection': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);
                    const coll = VariableAnchorOffsetCollection.parse(input);
                    if (coll) {
                        return coll;
                    }
                }
                throw new RuntimeError(`Could not parse variableAnchorOffsetCollection from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'number': {
                let value = null;
                for (const arg of this.args) {
                    value = arg.evaluate(ctx);
                    if (value === null)
                        return 0;
                    const num = Number(value);
                    if (isNaN(num))
                        continue;
                    return num;
                }
                throw new RuntimeError(`Could not convert ${JSON.stringify(value)} to number.`);
            }
            case 'formatted':
                // There is no explicit 'to-formatted' but this coercion can be implicitly
                // created by properties that expect the 'formatted' type.
                return Formatted.fromString(toString(this.args[0].evaluate(ctx)));
            case 'resolvedImage':
                return ResolvedImage.fromString(toString(this.args[0].evaluate(ctx)));
            default:
                return toString(this.args[0].evaluate(ctx));
        }
    }
    eachChild(fn) {
        this.args.forEach(fn);
    }
    outputDefined() {
        return this.args.every(arg => arg.outputDefined());
    }
}

const geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];
class EvaluationContext {
    constructor() {
        this.globals = null;
        this.feature = null;
        this.featureState = null;
        this.formattedSection = null;
        this._parseColorCache = {};
        this.availableImages = null;
        this.canonical = null;
    }
    id() {
        return this.feature && 'id' in this.feature ? this.feature.id : null;
    }
    geometryType() {
        return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
    }
    geometry() {
        return this.feature && 'geometry' in this.feature ? this.feature.geometry : null;
    }
    canonicalID() {
        return this.canonical;
    }
    properties() {
        return this.feature && this.feature.properties || {};
    }
    parseColor(input) {
        let cached = this._parseColorCache[input];
        if (!cached) {
            cached = this._parseColorCache[input] = Color.parse(input);
        }
        return cached;
    }
}

/**
 * State associated parsing at a given point in an expression tree.
 * @private
 */
class ParsingContext {
    constructor(registry, isConstantFunc, path = [], expectedType, scope = new Scope(), errors = []) {
        this.registry = registry;
        this.path = path;
        this.key = path.map(part => `[${part}]`).join('');
        this.scope = scope;
        this.errors = errors;
        this.expectedType = expectedType;
        this._isConstant = isConstantFunc;
    }
    /**
     * @param expr the JSON expression to parse
     * @param index the optional argument index if this expression is an argument of a parent expression that's being parsed
     * @param options
     * @param options.omitTypeAnnotations set true to omit inferred type annotations.  Caller beware: with this option set, the parsed expression's type will NOT satisfy `expectedType` if it would normally be wrapped in an inferred annotation.
     * @private
     */
    parse(expr, index, expectedType, bindings, options = {}) {
        if (index) {
            return this.concat(index, expectedType, bindings)._parse(expr, options);
        }
        return this._parse(expr, options);
    }
    _parse(expr, options) {
        if (expr === null || typeof expr === 'string' || typeof expr === 'boolean' || typeof expr === 'number') {
            expr = ['literal', expr];
        }
        function annotate(parsed, type, typeAnnotation) {
            if (typeAnnotation === 'assert') {
                return new Assertion(type, [parsed]);
            }
            else if (typeAnnotation === 'coerce') {
                return new Coercion(type, [parsed]);
            }
            else {
                return parsed;
            }
        }
        if (Array.isArray(expr)) {
            if (expr.length === 0) {
                return this.error('Expected an array with at least one element. If you wanted a literal array, use ["literal", []].');
            }
            const op = expr[0];
            if (typeof op !== 'string') {
                this.error(`Expression name must be a string, but found ${typeof op} instead. If you wanted a literal array, use ["literal", [...]].`, 0);
                return null;
            }
            const Expr = this.registry[op];
            if (Expr) {
                let parsed = Expr.parse(expr, this);
                if (!parsed)
                    return null;
                if (this.expectedType) {
                    const expected = this.expectedType;
                    const actual = parsed.type;
                    // When we expect a number, string, boolean, or array but have a value, wrap it in an assertion.
                    // When we expect a color or formatted string, but have a string or value, wrap it in a coercion.
                    // Otherwise, we do static type-checking.
                    //
                    // These behaviors are overridable for:
                    //   * The "coalesce" operator, which needs to omit type annotations.
                    //   * String-valued properties (e.g. `text-field`), where coercion is more convenient than assertion.
                    //
                    if ((expected.kind === 'string' || expected.kind === 'number' || expected.kind === 'boolean' || expected.kind === 'object' || expected.kind === 'array') && actual.kind === 'value') {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'assert');
                    }
                    else if ((expected.kind === 'color' || expected.kind === 'formatted' || expected.kind === 'resolvedImage') && (actual.kind === 'value' || actual.kind === 'string')) {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                    }
                    else if (expected.kind === 'padding' && (actual.kind === 'value' || actual.kind === 'number' || actual.kind === 'array')) {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                    }
                    else if (expected.kind === 'variableAnchorOffsetCollection' && (actual.kind === 'value' || actual.kind === 'array')) {
                        parsed = annotate(parsed, expected, options.typeAnnotation || 'coerce');
                    }
                    else if (this.checkSubtype(expected, actual)) {
                        return null;
                    }
                }
                // If an expression's arguments are all literals, we can evaluate
                // it immediately and replace it with a literal value in the
                // parsed/compiled result. Expressions that expect an image should
                // not be resolved here so we can later get the available images.
                if (!(parsed instanceof Literal) && (parsed.type.kind !== 'resolvedImage') && this._isConstant(parsed)) {
                    const ec = new EvaluationContext();
                    try {
                        parsed = new Literal(parsed.type, parsed.evaluate(ec));
                    }
                    catch (e) {
                        this.error(e.message);
                        return null;
                    }
                }
                return parsed;
            }
            return this.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
        }
        else if (typeof expr === 'undefined') {
            return this.error('\'undefined\' value invalid. Use null instead.');
        }
        else if (typeof expr === 'object') {
            return this.error('Bare objects invalid. Use ["literal", {...}] instead.');
        }
        else {
            return this.error(`Expected an array, but found ${typeof expr} instead.`);
        }
    }
    /**
     * Returns a copy of this context suitable for parsing the subexpression at
     * index `index`, optionally appending to 'let' binding map.
     *
     * Note that `errors` property, intended for collecting errors while
     * parsing, is copied by reference rather than cloned.
     * @private
     */
    concat(index, expectedType, bindings) {
        const path = typeof index === 'number' ? this.path.concat(index) : this.path;
        const scope = bindings ? this.scope.concat(bindings) : this.scope;
        return new ParsingContext(this.registry, this._isConstant, path, expectedType || null, scope, this.errors);
    }
    /**
     * Push a parsing (or type checking) error into the `this.errors`
     * @param error The message
     * @param keys Optionally specify the source of the error at a child
     * of the current expression at `this.key`.
     * @private
     */
    error(error, ...keys) {
        const key = `${this.key}${keys.map(k => `[${k}]`).join('')}`;
        this.errors.push(new ExpressionParsingError(key, error));
    }
    /**
     * Returns null if `t` is a subtype of `expected`; otherwise returns an
     * error message and also pushes it to `this.errors`.
     * @param expected The expected type
     * @param t The actual type
     * @returns null if `t` is a subtype of `expected`; otherwise returns an error message
     */
    checkSubtype(expected, t) {
        const error = checkSubtype(expected, t);
        if (error)
            this.error(error);
        return error;
    }
}

class CollatorExpression {
    constructor(caseSensitive, diacriticSensitive, locale) {
        this.type = CollatorType;
        this.locale = locale;
        this.caseSensitive = caseSensitive;
        this.diacriticSensitive = diacriticSensitive;
    }
    static parse(args, context) {
        if (args.length !== 2)
            return context.error('Expected one argument.');
        const options = args[1];
        if (typeof options !== 'object' || Array.isArray(options))
            return context.error('Collator options argument must be an object.');
        const caseSensitive = context.parse(options['case-sensitive'] === undefined ? false : options['case-sensitive'], 1, BooleanType);
        if (!caseSensitive)
            return null;
        const diacriticSensitive = context.parse(options['diacritic-sensitive'] === undefined ? false : options['diacritic-sensitive'], 1, BooleanType);
        if (!diacriticSensitive)
            return null;
        let locale = null;
        if (options['locale']) {
            locale = context.parse(options['locale'], 1, StringType);
            if (!locale)
                return null;
        }
        return new CollatorExpression(caseSensitive, diacriticSensitive, locale);
    }
    evaluate(ctx) {
        return new Collator(this.caseSensitive.evaluate(ctx), this.diacriticSensitive.evaluate(ctx), this.locale ? this.locale.evaluate(ctx) : null);
    }
    eachChild(fn) {
        fn(this.caseSensitive);
        fn(this.diacriticSensitive);
        if (this.locale) {
            fn(this.locale);
        }
    }
    outputDefined() {
        // Technically the set of possible outputs is the combinatoric set of Collators produced
        // by all possible outputs of locale/caseSensitive/diacriticSensitive
        // But for the primary use of Collators in comparison operators, we ignore the Collator's
        // possible outputs anyway, so we can get away with leaving this false for now.
        return false;
    }
}

const EXTENT = 8192;
function updateBBox(bbox, coord) {
    bbox[0] = Math.min(bbox[0], coord[0]);
    bbox[1] = Math.min(bbox[1], coord[1]);
    bbox[2] = Math.max(bbox[2], coord[0]);
    bbox[3] = Math.max(bbox[3], coord[1]);
}
function mercatorXfromLng(lng) {
    return (180 + lng) / 360;
}
function mercatorYfromLat(lat) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}
function boxWithinBox(bbox1, bbox2) {
    if (bbox1[0] <= bbox2[0])
        return false;
    if (bbox1[2] >= bbox2[2])
        return false;
    if (bbox1[1] <= bbox2[1])
        return false;
    if (bbox1[3] >= bbox2[3])
        return false;
    return true;
}
function getTileCoordinates(p, canonical) {
    const x = mercatorXfromLng(p[0]);
    const y = mercatorYfromLat(p[1]);
    const tilesAtZoom = Math.pow(2, canonical.z);
    return [Math.round(x * tilesAtZoom * EXTENT), Math.round(y * tilesAtZoom * EXTENT)];
}
function onBoundary(p, p1, p2) {
    const x1 = p[0] - p1[0];
    const y1 = p[1] - p1[1];
    const x2 = p[0] - p2[0];
    const y2 = p[1] - p2[1];
    return (x1 * y2 - x2 * y1 === 0) && (x1 * x2 <= 0) && (y1 * y2 <= 0);
}
function rayIntersect(p, p1, p2) {
    return ((p1[1] > p[1]) !== (p2[1] > p[1])) && (p[0] < (p2[0] - p1[0]) * (p[1] - p1[1]) / (p2[1] - p1[1]) + p1[0]);
}
// ray casting algorithm for detecting if point is in polygon
function pointWithinPolygon(point, rings) {
    let inside = false;
    for (let i = 0, len = rings.length; i < len; i++) {
        const ring = rings[i];
        for (let j = 0, len2 = ring.length; j < len2 - 1; j++) {
            if (onBoundary(point, ring[j], ring[j + 1]))
                return false;
            if (rayIntersect(point, ring[j], ring[j + 1]))
                inside = !inside;
        }
    }
    return inside;
}
function pointWithinPolygons(point, polygons) {
    for (let i = 0; i < polygons.length; i++) {
        if (pointWithinPolygon(point, polygons[i]))
            return true;
    }
    return false;
}
function perp(v1, v2) {
    return (v1[0] * v2[1] - v1[1] * v2[0]);
}
// check if p1 and p2 are in different sides of line segment q1->q2
function twoSided(p1, p2, q1, q2) {
    // q1->p1 (x1, y1), q1->p2 (x2, y2), q1->q2 (x3, y3)
    const x1 = p1[0] - q1[0];
    const y1 = p1[1] - q1[1];
    const x2 = p2[0] - q1[0];
    const y2 = p2[1] - q1[1];
    const x3 = q2[0] - q1[0];
    const y3 = q2[1] - q1[1];
    const det1 = (x1 * y3 - x3 * y1);
    const det2 = (x2 * y3 - x3 * y2);
    if ((det1 > 0 && det2 < 0) || (det1 < 0 && det2 > 0))
        return true;
    return false;
}
// a, b are end points for line segment1, c and d are end points for line segment2
function lineIntersectLine(a, b, c, d) {
    // check if two segments are parallel or not
    // precondition is end point a, b is inside polygon, if line a->b is
    // parallel to polygon edge c->d, then a->b won't intersect with c->d
    const vectorP = [b[0] - a[0], b[1] - a[1]];
    const vectorQ = [d[0] - c[0], d[1] - c[1]];
    if (perp(vectorQ, vectorP) === 0)
        return false;
    // If lines are intersecting with each other, the relative location should be:
    // a and b lie in different sides of segment c->d
    // c and d lie in different sides of segment a->b
    if (twoSided(a, b, c, d) && twoSided(c, d, a, b))
        return true;
    return false;
}
function lineIntersectPolygon(p1, p2, polygon) {
    for (const ring of polygon) {
        // loop through every edge of the ring
        for (let j = 0; j < ring.length - 1; ++j) {
            if (lineIntersectLine(p1, p2, ring[j], ring[j + 1])) {
                return true;
            }
        }
    }
    return false;
}
function lineStringWithinPolygon(line, polygon) {
    // First, check if geometry points of line segments are all inside polygon
    for (let i = 0; i < line.length; ++i) {
        if (!pointWithinPolygon(line[i], polygon)) {
            return false;
        }
    }
    // Second, check if there is line segment intersecting polygon edge
    for (let i = 0; i < line.length - 1; ++i) {
        if (lineIntersectPolygon(line[i], line[i + 1], polygon)) {
            return false;
        }
    }
    return true;
}
function lineStringWithinPolygons(line, polygons) {
    for (let i = 0; i < polygons.length; i++) {
        if (lineStringWithinPolygon(line, polygons[i]))
            return true;
    }
    return false;
}
function getTilePolygon(coordinates, bbox, canonical) {
    const polygon = [];
    for (let i = 0; i < coordinates.length; i++) {
        const ring = [];
        for (let j = 0; j < coordinates[i].length; j++) {
            const coord = getTileCoordinates(coordinates[i][j], canonical);
            updateBBox(bbox, coord);
            ring.push(coord);
        }
        polygon.push(ring);
    }
    return polygon;
}
function getTilePolygons(coordinates, bbox, canonical) {
    const polygons = [];
    for (let i = 0; i < coordinates.length; i++) {
        const polygon = getTilePolygon(coordinates[i], bbox, canonical);
        polygons.push(polygon);
    }
    return polygons;
}
function updatePoint(p, bbox, polyBBox, worldSize) {
    if (p[0] < polyBBox[0] || p[0] > polyBBox[2]) {
        const halfWorldSize = worldSize * 0.5;
        let shift = (p[0] - polyBBox[0] > halfWorldSize) ? -worldSize : (polyBBox[0] - p[0] > halfWorldSize) ? worldSize : 0;
        if (shift === 0) {
            shift = (p[0] - polyBBox[2] > halfWorldSize) ? -worldSize : (polyBBox[2] - p[0] > halfWorldSize) ? worldSize : 0;
        }
        p[0] += shift;
    }
    updateBBox(bbox, p);
}
function resetBBox(bbox) {
    bbox[0] = bbox[1] = Infinity;
    bbox[2] = bbox[3] = -Infinity;
}
function getTilePoints(geometry, pointBBox, polyBBox, canonical) {
    const worldSize = Math.pow(2, canonical.z) * EXTENT;
    const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
    const tilePoints = [];
    for (const points of geometry) {
        for (const point of points) {
            const p = [point.x + shifts[0], point.y + shifts[1]];
            updatePoint(p, pointBBox, polyBBox, worldSize);
            tilePoints.push(p);
        }
    }
    return tilePoints;
}
function getTileLines(geometry, lineBBox, polyBBox, canonical) {
    const worldSize = Math.pow(2, canonical.z) * EXTENT;
    const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
    const tileLines = [];
    for (const line of geometry) {
        const tileLine = [];
        for (const point of line) {
            const p = [point.x + shifts[0], point.y + shifts[1]];
            updateBBox(lineBBox, p);
            tileLine.push(p);
        }
        tileLines.push(tileLine);
    }
    if (lineBBox[2] - lineBBox[0] <= worldSize / 2) {
        resetBBox(lineBBox);
        for (const line of tileLines) {
            for (const p of line) {
                updatePoint(p, lineBBox, polyBBox, worldSize);
            }
        }
    }
    return tileLines;
}
function pointsWithinPolygons(ctx, polygonGeometry) {
    const pointBBox = [Infinity, Infinity, -Infinity, -Infinity];
    const polyBBox = [Infinity, Infinity, -Infinity, -Infinity];
    const canonical = ctx.canonicalID();
    if (polygonGeometry.type === 'Polygon') {
        const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
        const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
        if (!boxWithinBox(pointBBox, polyBBox))
            return false;
        for (const point of tilePoints) {
            if (!pointWithinPolygon(point, tilePolygon))
                return false;
        }
    }
    if (polygonGeometry.type === 'MultiPolygon') {
        const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
        const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
        if (!boxWithinBox(pointBBox, polyBBox))
            return false;
        for (const point of tilePoints) {
            if (!pointWithinPolygons(point, tilePolygons))
                return false;
        }
    }
    return true;
}
function linesWithinPolygons(ctx, polygonGeometry) {
    const lineBBox = [Infinity, Infinity, -Infinity, -Infinity];
    const polyBBox = [Infinity, Infinity, -Infinity, -Infinity];
    const canonical = ctx.canonicalID();
    if (polygonGeometry.type === 'Polygon') {
        const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
        const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
        if (!boxWithinBox(lineBBox, polyBBox))
            return false;
        for (const line of tileLines) {
            if (!lineStringWithinPolygon(line, tilePolygon))
                return false;
        }
    }
    if (polygonGeometry.type === 'MultiPolygon') {
        const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
        const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
        if (!boxWithinBox(lineBBox, polyBBox))
            return false;
        for (const line of tileLines) {
            if (!lineStringWithinPolygons(line, tilePolygons))
                return false;
        }
    }
    return true;
}
class Within {
    constructor(geojson, geometries) {
        this.type = BooleanType;
        this.geojson = geojson;
        this.geometries = geometries;
    }
    static parse(args, context) {
        if (args.length !== 2)
            return context.error(`'within' expression requires exactly one argument, but found ${args.length - 1} instead.`);
        if (isValue(args[1])) {
            const geojson = args[1];
            if (geojson.type === 'FeatureCollection') {
                for (let i = 0; i < geojson.features.length; ++i) {
                    const type = geojson.features[i].geometry.type;
                    if (type === 'Polygon' || type === 'MultiPolygon') {
                        return new Within(geojson, geojson.features[i].geometry);
                    }
                }
            }
            else if (geojson.type === 'Feature') {
                const type = geojson.geometry.type;
                if (type === 'Polygon' || type === 'MultiPolygon') {
                    return new Within(geojson, geojson.geometry);
                }
            }
            else if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
                return new Within(geojson, geojson);
            }
        }
        return context.error('\'within\' expression requires valid geojson object that contains polygon geometry type.');
    }
    evaluate(ctx) {
        if (ctx.geometry() != null && ctx.canonicalID() != null) {
            if (ctx.geometryType() === 'Point') {
                return pointsWithinPolygons(ctx, this.geometries);
            }
            else if (ctx.geometryType() === 'LineString') {
                return linesWithinPolygons(ctx, this.geometries);
            }
        }
        return false;
    }
    eachChild() { }
    outputDefined() {
        return true;
    }
}

class Var {
    constructor(name, boundExpression) {
        this.type = boundExpression.type;
        this.name = name;
        this.boundExpression = boundExpression;
    }
    static parse(args, context) {
        if (args.length !== 2 || typeof args[1] !== 'string')
            return context.error('\'var\' expression requires exactly one string literal argument.');
        const name = args[1];
        if (!context.scope.has(name)) {
            return context.error(`Unknown variable "${name}". Make sure "${name}" has been bound in an enclosing "let" expression before using it.`, 1);
        }
        return new Var(name, context.scope.get(name));
    }
    evaluate(ctx) {
        return this.boundExpression.evaluate(ctx);
    }
    eachChild() { }
    outputDefined() {
        return false;
    }
}

class CompoundExpression {
    constructor(name, type, evaluate, args) {
        this.name = name;
        this.type = type;
        this._evaluate = evaluate;
        this.args = args;
    }
    evaluate(ctx) {
        return this._evaluate(ctx, this.args);
    }
    eachChild(fn) {
        this.args.forEach(fn);
    }
    outputDefined() {
        return false;
    }
    static parse(args, context) {
        const op = args[0];
        const definition = CompoundExpression.definitions[op];
        if (!definition) {
            return context.error(`Unknown expression "${op}". If you wanted a literal array, use ["literal", [...]].`, 0);
        }
        // Now check argument types against each signature
        const type = Array.isArray(definition) ?
            definition[0] : definition.type;
        const availableOverloads = Array.isArray(definition) ?
            [[definition[1], definition[2]]] :
            definition.overloads;
        const overloads = availableOverloads.filter(([signature]) => (!Array.isArray(signature) || // varags
            signature.length === args.length - 1 // correct param count
        ));
        let signatureContext = null;
        for (const [params, evaluate] of overloads) {
            // Use a fresh context for each attempted signature so that, if
            // we eventually succeed, we haven't polluted `context.errors`.
            signatureContext = new ParsingContext(context.registry, isExpressionConstant, context.path, null, context.scope);
            // First parse all the args, potentially coercing to the
            // types expected by this overload.
            const parsedArgs = [];
            let argParseFailed = false;
            for (let i = 1; i < args.length; i++) {
                const arg = args[i];
                const expectedType = Array.isArray(params) ?
                    params[i - 1] :
                    params.type;
                const parsed = signatureContext.parse(arg, 1 + parsedArgs.length, expectedType);
                if (!parsed) {
                    argParseFailed = true;
                    break;
                }
                parsedArgs.push(parsed);
            }
            if (argParseFailed) {
                // Couldn't coerce args of this overload to expected type, move
                // on to next one.
                continue;
            }
            if (Array.isArray(params)) {
                if (params.length !== parsedArgs.length) {
                    signatureContext.error(`Expected ${params.length} arguments, but found ${parsedArgs.length} instead.`);
                    continue;
                }
            }
            for (let i = 0; i < parsedArgs.length; i++) {
                const expected = Array.isArray(params) ? params[i] : params.type;
                const arg = parsedArgs[i];
                signatureContext.concat(i + 1).checkSubtype(expected, arg.type);
            }
            if (signatureContext.errors.length === 0) {
                return new CompoundExpression(op, type, evaluate, parsedArgs);
            }
        }
        if (overloads.length === 1) {
            context.errors.push(...signatureContext.errors);
        }
        else {
            const expected = overloads.length ? overloads : availableOverloads;
            const signatures = expected
                .map(([params]) => stringifySignature(params))
                .join(' | ');
            const actualTypes = [];
            // For error message, re-parse arguments without trying to
            // apply any coercions
            for (let i = 1; i < args.length; i++) {
                const parsed = context.parse(args[i], 1 + actualTypes.length);
                if (!parsed)
                    return null;
                actualTypes.push(toString$1(parsed.type));
            }
            context.error(`Expected arguments of type ${signatures}, but found (${actualTypes.join(', ')}) instead.`);
        }
        return null;
    }
    static register(registry, definitions) {
        CompoundExpression.definitions = definitions;
        for (const name in definitions) {
            registry[name] = CompoundExpression;
        }
    }
}
function stringifySignature(signature) {
    if (Array.isArray(signature)) {
        return `(${signature.map(toString$1).join(', ')})`;
    }
    else {
        return `(${toString$1(signature.type)}...)`;
    }
}
function isExpressionConstant(expression) {
    if (expression instanceof Var) {
        return isExpressionConstant(expression.boundExpression);
    }
    else if (expression instanceof CompoundExpression && expression.name === 'error') {
        return false;
    }
    else if (expression instanceof CollatorExpression) {
        // Although the results of a Collator expression with fixed arguments
        // generally shouldn't change between executions, we can't serialize them
        // as constant expressions because results change based on environment.
        return false;
    }
    else if (expression instanceof Within) {
        return false;
    }
    const isTypeAnnotation = expression instanceof Coercion ||
        expression instanceof Assertion;
    let childrenConstant = true;
    expression.eachChild(child => {
        // We can _almost_ assume that if `expressions` children are constant,
        // they would already have been evaluated to Literal values when they
        // were parsed.  Type annotations are the exception, because they might
        // have been inferred and added after a child was parsed.
        // So we recurse into isConstant() for the children of type annotations,
        // but otherwise simply check whether they are Literals.
        if (isTypeAnnotation) {
            childrenConstant = childrenConstant && isExpressionConstant(child);
        }
        else {
            childrenConstant = childrenConstant && child instanceof Literal;
        }
    });
    if (!childrenConstant) {
        return false;
    }
    return isFeatureConstant(expression) &&
        isGlobalPropertyConstant(expression, ['zoom', 'heatmap-density', 'line-progress', 'accumulated', 'is-supported-script']);
}
function isFeatureConstant(e) {
    if (e instanceof CompoundExpression) {
        if (e.name === 'get' && e.args.length === 1) {
            return false;
        }
        else if (e.name === 'feature-state') {
            return false;
        }
        else if (e.name === 'has' && e.args.length === 1) {
            return false;
        }
        else if (e.name === 'properties' ||
            e.name === 'geometry-type' ||
            e.name === 'id') {
            return false;
        }
        else if (/^filter-/.test(e.name)) {
            return false;
        }
    }
    if (e instanceof Within) {
        return false;
    }
    let result = true;
    e.eachChild(arg => {
        if (result && !isFeatureConstant(arg)) {
            result = false;
        }
    });
    return result;
}
function isStateConstant(e) {
    if (e instanceof CompoundExpression) {
        if (e.name === 'feature-state') {
            return false;
        }
    }
    let result = true;
    e.eachChild(arg => {
        if (result && !isStateConstant(arg)) {
            result = false;
        }
    });
    return result;
}
function isGlobalPropertyConstant(e, properties) {
    if (e instanceof CompoundExpression && properties.indexOf(e.name) >= 0) {
        return false;
    }
    let result = true;
    e.eachChild((arg) => {
        if (result && !isGlobalPropertyConstant(arg, properties)) {
            result = false;
        }
    });
    return result;
}

/**
 * Returns the index of the last stop <= input, or 0 if it doesn't exist.
 * @private
 */
function findStopLessThanOrEqualTo(stops, input) {
    const lastIndex = stops.length - 1;
    let lowerIndex = 0;
    let upperIndex = lastIndex;
    let currentIndex = 0;
    let currentValue, nextValue;
    while (lowerIndex <= upperIndex) {
        currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
        currentValue = stops[currentIndex];
        nextValue = stops[currentIndex + 1];
        if (currentValue <= input) {
            if (currentIndex === lastIndex || input < nextValue) { // Search complete
                return currentIndex;
            }
            lowerIndex = currentIndex + 1;
        }
        else if (currentValue > input) {
            upperIndex = currentIndex - 1;
        }
        else {
            throw new RuntimeError('Input is not a number.');
        }
    }
    return 0;
}

class Step {
    constructor(type, input, stops) {
        this.type = type;
        this.input = input;
        this.labels = [];
        this.outputs = [];
        for (const [label, expression] of stops) {
            this.labels.push(label);
            this.outputs.push(expression);
        }
    }
    static parse(args, context) {
        if (args.length - 1 < 4) {
            return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
        }
        if ((args.length - 1) % 2 !== 0) {
            return context.error('Expected an even number of arguments.');
        }
        const input = context.parse(args[1], 1, NumberType);
        if (!input)
            return null;
        const stops = [];
        let outputType = null;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }
        for (let i = 1; i < args.length; i += 2) {
            const label = i === 1 ? -Infinity : args[i];
            const value = args[i + 1];
            const labelKey = i;
            const valueKey = i + 1;
            if (typeof label !== 'number') {
                return context.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
            }
            if (stops.length && stops[stops.length - 1][0] >= label) {
                return context.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.', labelKey);
            }
            const parsed = context.parse(value, valueKey, outputType);
            if (!parsed)
                return null;
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
        }
        return new Step(outputType, input, stops);
    }
    evaluate(ctx) {
        const labels = this.labels;
        const outputs = this.outputs;
        if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
        }
        const value = this.input.evaluate(ctx);
        if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
        }
        const stopCount = labels.length;
        if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
        }
        const index = findStopLessThanOrEqualTo(labels, value);
        return outputs[index].evaluate(ctx);
    }
    eachChild(fn) {
        fn(this.input);
        for (const expression of this.outputs) {
            fn(expression);
        }
    }
    outputDefined() {
        return this.outputs.every(out => out.outputDefined());
    }
}

function number(from, to, t) {
    return from + t * (to - from);
}
function color(from, to, t, spaceKey = 'rgb') {
    switch (spaceKey) {
        case 'rgb': {
            const [r, g, b, alpha] = array(from.rgb, to.rgb, t);
            return new Color(r, g, b, alpha, false);
        }
        case 'hcl': {
            const [hue0, chroma0, light0, alphaF] = from.hcl;
            const [hue1, chroma1, light1, alphaT] = to.hcl;
            // https://github.com/gka/chroma.js/blob/cd1b3c0926c7a85cbdc3b1453b3a94006de91a92/src/interpolator/_hsx.js
            let hue, chroma;
            if (!isNaN(hue0) && !isNaN(hue1)) {
                let dh = hue1 - hue0;
                if (hue1 > hue0 && dh > 180) {
                    dh -= 360;
                }
                else if (hue1 < hue0 && hue0 - hue1 > 180) {
                    dh += 360;
                }
                hue = hue0 + t * dh;
            }
            else if (!isNaN(hue0)) {
                hue = hue0;
                if (light1 === 1 || light1 === 0)
                    chroma = chroma0;
            }
            else if (!isNaN(hue1)) {
                hue = hue1;
                if (light0 === 1 || light0 === 0)
                    chroma = chroma1;
            }
            else {
                hue = NaN;
            }
            const [r, g, b, alpha] = hclToRgb([
                hue,
                chroma !== null && chroma !== void 0 ? chroma : number(chroma0, chroma1, t),
                number(light0, light1, t),
                number(alphaF, alphaT, t),
            ]);
            return new Color(r, g, b, alpha, false);
        }
        case 'lab': {
            const [r, g, b, alpha] = labToRgb(array(from.lab, to.lab, t));
            return new Color(r, g, b, alpha, false);
        }
    }
}
function array(from, to, t) {
    return from.map((d, i) => {
        return number(d, to[i], t);
    });
}
function padding(from, to, t) {
    return new Padding(array(from.values, to.values, t));
}
function variableAnchorOffsetCollection(from, to, t) {
    const fromValues = from.values;
    const toValues = to.values;
    if (fromValues.length !== toValues.length) {
        throw new RuntimeError(`Cannot interpolate values of different length. from: ${from.toString()}, to: ${to.toString()}`);
    }
    const output = [];
    for (let i = 0; i < fromValues.length; i += 2) {
        // Anchor entries must match
        if (fromValues[i] !== toValues[i]) {
            throw new RuntimeError(`Cannot interpolate values containing mismatched anchors. from[${i}]: ${fromValues[i]}, to[${i}]: ${toValues[i]}`);
        }
        output.push(fromValues[i]);
        // Interpolate the offset values for each anchor
        const [fx, fy] = fromValues[i + 1];
        const [tx, ty] = toValues[i + 1];
        output.push([number(fx, tx, t), number(fy, ty, t)]);
    }
    return new VariableAnchorOffsetCollection(output);
}
const interpolate = {
    number,
    color,
    array,
    padding,
    variableAnchorOffsetCollection
};

class Interpolate {
    constructor(type, operator, interpolation, input, stops) {
        this.type = type;
        this.operator = operator;
        this.interpolation = interpolation;
        this.input = input;
        this.labels = [];
        this.outputs = [];
        for (const [label, expression] of stops) {
            this.labels.push(label);
            this.outputs.push(expression);
        }
    }
    static interpolationFactor(interpolation, input, lower, upper) {
        let t = 0;
        if (interpolation.name === 'exponential') {
            t = exponentialInterpolation(input, interpolation.base, lower, upper);
        }
        else if (interpolation.name === 'linear') {
            t = exponentialInterpolation(input, 1, lower, upper);
        }
        else if (interpolation.name === 'cubic-bezier') {
            const c = interpolation.controlPoints;
            const ub = new UnitBezier(c[0], c[1], c[2], c[3]);
            t = ub.solve(exponentialInterpolation(input, 1, lower, upper));
        }
        return t;
    }
    static parse(args, context) {
        let [operator, interpolation, input, ...rest] = args;
        if (!Array.isArray(interpolation) || interpolation.length === 0) {
            return context.error('Expected an interpolation type expression.', 1);
        }
        if (interpolation[0] === 'linear') {
            interpolation = { name: 'linear' };
        }
        else if (interpolation[0] === 'exponential') {
            const base = interpolation[1];
            if (typeof base !== 'number')
                return context.error('Exponential interpolation requires a numeric base.', 1, 1);
            interpolation = {
                name: 'exponential',
                base
            };
        }
        else if (interpolation[0] === 'cubic-bezier') {
            const controlPoints = interpolation.slice(1);
            if (controlPoints.length !== 4 ||
                controlPoints.some(t => typeof t !== 'number' || t < 0 || t > 1)) {
                return context.error('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.', 1);
            }
            interpolation = {
                name: 'cubic-bezier',
                controlPoints: controlPoints
            };
        }
        else {
            return context.error(`Unknown interpolation type ${String(interpolation[0])}`, 1, 0);
        }
        if (args.length - 1 < 4) {
            return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
        }
        if ((args.length - 1) % 2 !== 0) {
            return context.error('Expected an even number of arguments.');
        }
        input = context.parse(input, 2, NumberType);
        if (!input)
            return null;
        const stops = [];
        let outputType = null;
        if (operator === 'interpolate-hcl' || operator === 'interpolate-lab') {
            outputType = ColorType;
        }
        else if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }
        for (let i = 0; i < rest.length; i += 2) {
            const label = rest[i];
            const value = rest[i + 1];
            const labelKey = i + 3;
            const valueKey = i + 4;
            if (typeof label !== 'number') {
                return context.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.', labelKey);
            }
            if (stops.length && stops[stops.length - 1][0] >= label) {
                return context.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.', labelKey);
            }
            const parsed = context.parse(value, valueKey, outputType);
            if (!parsed)
                return null;
            outputType = outputType || parsed.type;
            stops.push([label, parsed]);
        }
        if (!verifyType(outputType, NumberType) &&
            !verifyType(outputType, ColorType) &&
            !verifyType(outputType, PaddingType) &&
            !verifyType(outputType, VariableAnchorOffsetCollectionType) &&
            !verifyType(outputType, array$1(NumberType))) {
            return context.error(`Type ${toString$1(outputType)} is not interpolatable.`);
        }
        return new Interpolate(outputType, operator, interpolation, input, stops);
    }
    evaluate(ctx) {
        const labels = this.labels;
        const outputs = this.outputs;
        if (labels.length === 1) {
            return outputs[0].evaluate(ctx);
        }
        const value = this.input.evaluate(ctx);
        if (value <= labels[0]) {
            return outputs[0].evaluate(ctx);
        }
        const stopCount = labels.length;
        if (value >= labels[stopCount - 1]) {
            return outputs[stopCount - 1].evaluate(ctx);
        }
        const index = findStopLessThanOrEqualTo(labels, value);
        const lower = labels[index];
        const upper = labels[index + 1];
        const t = Interpolate.interpolationFactor(this.interpolation, value, lower, upper);
        const outputLower = outputs[index].evaluate(ctx);
        const outputUpper = outputs[index + 1].evaluate(ctx);
        switch (this.operator) {
            case 'interpolate':
                return interpolate[this.type.kind](outputLower, outputUpper, t);
            case 'interpolate-hcl':
                return interpolate.color(outputLower, outputUpper, t, 'hcl');
            case 'interpolate-lab':
                return interpolate.color(outputLower, outputUpper, t, 'lab');
        }
    }
    eachChild(fn) {
        fn(this.input);
        for (const expression of this.outputs) {
            fn(expression);
        }
    }
    outputDefined() {
        return this.outputs.every(out => out.outputDefined());
    }
}
/**
 * Returns a ratio that can be used to interpolate between exponential function
 * stops.
 * How it works: Two consecutive stop values define a (scaled and shifted) exponential function `f(x) = a * base^x + b`, where `base` is the user-specified base,
 * and `a` and `b` are constants affording sufficient degrees of freedom to fit
 * the function to the given stops.
 *
 * Here's a bit of algebra that lets us compute `f(x)` directly from the stop
 * values without explicitly solving for `a` and `b`:
 *
 * First stop value: `f(x0) = y0 = a * base^x0 + b`
 * Second stop value: `f(x1) = y1 = a * base^x1 + b`
 * => `y1 - y0 = a(base^x1 - base^x0)`
 * => `a = (y1 - y0)/(base^x1 - base^x0)`
 *
 * Desired value: `f(x) = y = a * base^x + b`
 * => `f(x) = y0 + a * (base^x - base^x0)`
 *
 * From the above, we can replace the `a` in `a * (base^x - base^x0)` and do a
 * little algebra:
 * ```
 * a * (base^x - base^x0) = (y1 - y0)/(base^x1 - base^x0) * (base^x - base^x0)
 *                     = (y1 - y0) * (base^x - base^x0) / (base^x1 - base^x0)
 * ```
 *
 * If we let `(base^x - base^x0) / (base^x1 base^x0)`, then we have
 * `f(x) = y0 + (y1 - y0) * ratio`.  In other words, `ratio` may be treated as
 * an interpolation factor between the two stops' output values.
 *
 * (Note: a slightly different form for `ratio`,
 * `(base^(x-x0) - 1) / (base^(x1-x0) - 1) `, is equivalent, but requires fewer
 * expensive `Math.pow()` operations.)
 *
 * @private
*/
function exponentialInterpolation(input, base, lowerValue, upperValue) {
    const difference = upperValue - lowerValue;
    const progress = input - lowerValue;
    if (difference === 0) {
        return 0;
    }
    else if (base === 1) {
        return progress / difference;
    }
    else {
        return (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }
}

class Coalesce {
    constructor(type, args) {
        this.type = type;
        this.args = args;
    }
    static parse(args, context) {
        if (args.length < 2) {
            return context.error('Expectected at least one argument.');
        }
        let outputType = null;
        const expectedType = context.expectedType;
        if (expectedType && expectedType.kind !== 'value') {
            outputType = expectedType;
        }
        const parsedArgs = [];
        for (const arg of args.slice(1)) {
            const parsed = context.parse(arg, 1 + parsedArgs.length, outputType, undefined, { typeAnnotation: 'omit' });
            if (!parsed)
                return null;
            outputType = outputType || parsed.type;
            parsedArgs.push(parsed);
        }
        if (!outputType)
            throw new Error('No output type');
        // Above, we parse arguments without inferred type annotation so that
        // they don't produce a runtime error for `null` input, which would
        // preempt the desired null-coalescing behavior.
        // Thus, if any of our arguments would have needed an annotation, we
        // need to wrap the enclosing coalesce expression with it instead.
        const needsAnnotation = expectedType &&
            parsedArgs.some(arg => checkSubtype(expectedType, arg.type));
        return needsAnnotation ?
            new Coalesce(ValueType, parsedArgs) :
            new Coalesce(outputType, parsedArgs);
    }
    evaluate(ctx) {
        let result = null;
        let argCount = 0;
        let requestedImageName;
        for (const arg of this.args) {
            argCount++;
            result = arg.evaluate(ctx);
            // we need to keep track of the first requested image in a coalesce statement
            // if coalesce can't find a valid image, we return the first image name so styleimagemissing can fire
            if (result && result instanceof ResolvedImage && !result.available) {
                if (!requestedImageName) {
                    requestedImageName = result.name;
                }
                result = null;
                if (argCount === this.args.length) {
                    result = requestedImageName;
                }
            }
            if (result !== null)
                break;
        }
        return result;
    }
    eachChild(fn) {
        this.args.forEach(fn);
    }
    outputDefined() {
        return this.args.every(arg => arg.outputDefined());
    }
}

class Let {
    constructor(bindings, result) {
        this.type = result.type;
        this.bindings = [].concat(bindings);
        this.result = result;
    }
    evaluate(ctx) {
        return this.result.evaluate(ctx);
    }
    eachChild(fn) {
        for (const binding of this.bindings) {
            fn(binding[1]);
        }
        fn(this.result);
    }
    static parse(args, context) {
        if (args.length < 4)
            return context.error(`Expected at least 3 arguments, but found ${args.length - 1} instead.`);
        const bindings = [];
        for (let i = 1; i < args.length - 1; i += 2) {
            const name = args[i];
            if (typeof name !== 'string') {
                return context.error(`Expected string, but found ${typeof name} instead.`, i);
            }
            if (/[^a-zA-Z0-9_]/.test(name)) {
                return context.error('Variable names must contain only alphanumeric characters or \'_\'.', i);
            }
            const value = context.parse(args[i + 1], i + 1);
            if (!value)
                return null;
            bindings.push([name, value]);
        }
        const result = context.parse(args[args.length - 1], args.length - 1, context.expectedType, bindings);
        if (!result)
            return null;
        return new Let(bindings, result);
    }
    outputDefined() {
        return this.result.outputDefined();
    }
}

class At {
    constructor(type, index, input) {
        this.type = type;
        this.index = index;
        this.input = input;
    }
    static parse(args, context) {
        if (args.length !== 3)
            return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
        const index = context.parse(args[1], 1, NumberType);
        const input = context.parse(args[2], 2, array$1(context.expectedType || ValueType));
        if (!index || !input)
            return null;
        const t = input.type;
        return new At(t.itemType, index, input);
    }
    evaluate(ctx) {
        const index = this.index.evaluate(ctx);
        const array = this.input.evaluate(ctx);
        if (index < 0) {
            throw new RuntimeError(`Array index out of bounds: ${index} < 0.`);
        }
        if (index >= array.length) {
            throw new RuntimeError(`Array index out of bounds: ${index} > ${array.length - 1}.`);
        }
        if (index !== Math.floor(index)) {
            throw new RuntimeError(`Array index must be an integer, but found ${index} instead.`);
        }
        return array[index];
    }
    eachChild(fn) {
        fn(this.index);
        fn(this.input);
    }
    outputDefined() {
        return false;
    }
}

class In {
    constructor(needle, haystack) {
        this.type = BooleanType;
        this.needle = needle;
        this.haystack = haystack;
    }
    static parse(args, context) {
        if (args.length !== 3) {
            return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
        }
        const needle = context.parse(args[1], 1, ValueType);
        const haystack = context.parse(args[2], 2, ValueType);
        if (!needle || !haystack)
            return null;
        if (!isValidType(needle.type, [BooleanType, StringType, NumberType, NullType, ValueType])) {
            return context.error(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(needle.type)} instead`);
        }
        return new In(needle, haystack);
    }
    evaluate(ctx) {
        const needle = this.needle.evaluate(ctx);
        const haystack = this.haystack.evaluate(ctx);
        if (!haystack)
            return false;
        if (!isValidNativeType(needle, ['boolean', 'string', 'number', 'null'])) {
            throw new RuntimeError(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(typeOf(needle))} instead.`);
        }
        if (!isValidNativeType(haystack, ['string', 'array'])) {
            throw new RuntimeError(`Expected second argument to be of type array or string, but found ${toString$1(typeOf(haystack))} instead.`);
        }
        return haystack.indexOf(needle) >= 0;
    }
    eachChild(fn) {
        fn(this.needle);
        fn(this.haystack);
    }
    outputDefined() {
        return true;
    }
}

class IndexOf {
    constructor(needle, haystack, fromIndex) {
        this.type = NumberType;
        this.needle = needle;
        this.haystack = haystack;
        this.fromIndex = fromIndex;
    }
    static parse(args, context) {
        if (args.length <= 2 || args.length >= 5) {
            return context.error(`Expected 3 or 4 arguments, but found ${args.length - 1} instead.`);
        }
        const needle = context.parse(args[1], 1, ValueType);
        const haystack = context.parse(args[2], 2, ValueType);
        if (!needle || !haystack)
            return null;
        if (!isValidType(needle.type, [BooleanType, StringType, NumberType, NullType, ValueType])) {
            return context.error(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(needle.type)} instead`);
        }
        if (args.length === 4) {
            const fromIndex = context.parse(args[3], 3, NumberType);
            if (!fromIndex)
                return null;
            return new IndexOf(needle, haystack, fromIndex);
        }
        else {
            return new IndexOf(needle, haystack);
        }
    }
    evaluate(ctx) {
        const needle = this.needle.evaluate(ctx);
        const haystack = this.haystack.evaluate(ctx);
        if (!isValidNativeType(needle, ['boolean', 'string', 'number', 'null'])) {
            throw new RuntimeError(`Expected first argument to be of type boolean, string, number or null, but found ${toString$1(typeOf(needle))} instead.`);
        }
        if (!isValidNativeType(haystack, ['string', 'array'])) {
            throw new RuntimeError(`Expected second argument to be of type array or string, but found ${toString$1(typeOf(haystack))} instead.`);
        }
        if (this.fromIndex) {
            const fromIndex = this.fromIndex.evaluate(ctx);
            return haystack.indexOf(needle, fromIndex);
        }
        return haystack.indexOf(needle);
    }
    eachChild(fn) {
        fn(this.needle);
        fn(this.haystack);
        if (this.fromIndex) {
            fn(this.fromIndex);
        }
    }
    outputDefined() {
        return false;
    }
}

class Match {
    constructor(inputType, outputType, input, cases, outputs, otherwise) {
        this.inputType = inputType;
        this.type = outputType;
        this.input = input;
        this.cases = cases;
        this.outputs = outputs;
        this.otherwise = otherwise;
    }
    static parse(args, context) {
        if (args.length < 5)
            return context.error(`Expected at least 4 arguments, but found only ${args.length - 1}.`);
        if (args.length % 2 !== 1)
            return context.error('Expected an even number of arguments.');
        let inputType;
        let outputType;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }
        const cases = {};
        const outputs = [];
        for (let i = 2; i < args.length - 1; i += 2) {
            let labels = args[i];
            const value = args[i + 1];
            if (!Array.isArray(labels)) {
                labels = [labels];
            }
            const labelContext = context.concat(i);
            if (labels.length === 0) {
                return labelContext.error('Expected at least one branch label.');
            }
            for (const label of labels) {
                if (typeof label !== 'number' && typeof label !== 'string') {
                    return labelContext.error('Branch labels must be numbers or strings.');
                }
                else if (typeof label === 'number' && Math.abs(label) > Number.MAX_SAFE_INTEGER) {
                    return labelContext.error(`Branch labels must be integers no larger than ${Number.MAX_SAFE_INTEGER}.`);
                }
                else if (typeof label === 'number' && Math.floor(label) !== label) {
                    return labelContext.error('Numeric branch labels must be integer values.');
                }
                else if (!inputType) {
                    inputType = typeOf(label);
                }
                else if (labelContext.checkSubtype(inputType, typeOf(label))) {
                    return null;
                }
                if (typeof cases[String(label)] !== 'undefined') {
                    return labelContext.error('Branch labels must be unique.');
                }
                cases[String(label)] = outputs.length;
            }
            const result = context.parse(value, i, outputType);
            if (!result)
                return null;
            outputType = outputType || result.type;
            outputs.push(result);
        }
        const input = context.parse(args[1], 1, ValueType);
        if (!input)
            return null;
        const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
        if (!otherwise)
            return null;
        if (input.type.kind !== 'value' && context.concat(1).checkSubtype(inputType, input.type)) {
            return null;
        }
        return new Match(inputType, outputType, input, cases, outputs, otherwise);
    }
    evaluate(ctx) {
        const input = this.input.evaluate(ctx);
        const output = (typeOf(input) === this.inputType && this.outputs[this.cases[input]]) || this.otherwise;
        return output.evaluate(ctx);
    }
    eachChild(fn) {
        fn(this.input);
        this.outputs.forEach(fn);
        fn(this.otherwise);
    }
    outputDefined() {
        return this.outputs.every(out => out.outputDefined()) && this.otherwise.outputDefined();
    }
}

class Case {
    constructor(type, branches, otherwise) {
        this.type = type;
        this.branches = branches;
        this.otherwise = otherwise;
    }
    static parse(args, context) {
        if (args.length < 4)
            return context.error(`Expected at least 3 arguments, but found only ${args.length - 1}.`);
        if (args.length % 2 !== 0)
            return context.error('Expected an odd number of arguments.');
        let outputType;
        if (context.expectedType && context.expectedType.kind !== 'value') {
            outputType = context.expectedType;
        }
        const branches = [];
        for (let i = 1; i < args.length - 1; i += 2) {
            const test = context.parse(args[i], i, BooleanType);
            if (!test)
                return null;
            const result = context.parse(args[i + 1], i + 1, outputType);
            if (!result)
                return null;
            branches.push([test, result]);
            outputType = outputType || result.type;
        }
        const otherwise = context.parse(args[args.length - 1], args.length - 1, outputType);
        if (!otherwise)
            return null;
        if (!outputType)
            throw new Error('Can\'t infer output type');
        return new Case(outputType, branches, otherwise);
    }
    evaluate(ctx) {
        for (const [test, expression] of this.branches) {
            if (test.evaluate(ctx)) {
                return expression.evaluate(ctx);
            }
        }
        return this.otherwise.evaluate(ctx);
    }
    eachChild(fn) {
        for (const [test, expression] of this.branches) {
            fn(test);
            fn(expression);
        }
        fn(this.otherwise);
    }
    outputDefined() {
        return this.branches.every(([_, out]) => out.outputDefined()) && this.otherwise.outputDefined();
    }
}

class Slice {
    constructor(type, input, beginIndex, endIndex) {
        this.type = type;
        this.input = input;
        this.beginIndex = beginIndex;
        this.endIndex = endIndex;
    }
    static parse(args, context) {
        if (args.length <= 2 || args.length >= 5) {
            return context.error(`Expected 3 or 4 arguments, but found ${args.length - 1} instead.`);
        }
        const input = context.parse(args[1], 1, ValueType);
        const beginIndex = context.parse(args[2], 2, NumberType);
        if (!input || !beginIndex)
            return null;
        if (!isValidType(input.type, [array$1(ValueType), StringType, ValueType])) {
            return context.error(`Expected first argument to be of type array or string, but found ${toString$1(input.type)} instead`);
        }
        if (args.length === 4) {
            const endIndex = context.parse(args[3], 3, NumberType);
            if (!endIndex)
                return null;
            return new Slice(input.type, input, beginIndex, endIndex);
        }
        else {
            return new Slice(input.type, input, beginIndex);
        }
    }
    evaluate(ctx) {
        const input = this.input.evaluate(ctx);
        const beginIndex = this.beginIndex.evaluate(ctx);
        if (!isValidNativeType(input, ['string', 'array'])) {
            throw new RuntimeError(`Expected first argument to be of type array or string, but found ${toString$1(typeOf(input))} instead.`);
        }
        if (this.endIndex) {
            const endIndex = this.endIndex.evaluate(ctx);
            return input.slice(beginIndex, endIndex);
        }
        return input.slice(beginIndex);
    }
    eachChild(fn) {
        fn(this.input);
        fn(this.beginIndex);
        if (this.endIndex) {
            fn(this.endIndex);
        }
    }
    outputDefined() {
        return false;
    }
}

function isComparableType(op, type) {
    if (op === '==' || op === '!=') {
        // equality operator
        return type.kind === 'boolean' ||
            type.kind === 'string' ||
            type.kind === 'number' ||
            type.kind === 'null' ||
            type.kind === 'value';
    }
    else {
        // ordering operator
        return type.kind === 'string' ||
            type.kind === 'number' ||
            type.kind === 'value';
    }
}
function eq(ctx, a, b) { return a === b; }
function neq(ctx, a, b) { return a !== b; }
function lt(ctx, a, b) { return a < b; }
function gt(ctx, a, b) { return a > b; }
function lteq(ctx, a, b) { return a <= b; }
function gteq(ctx, a, b) { return a >= b; }
function eqCollate(ctx, a, b, c) { return c.compare(a, b) === 0; }
function neqCollate(ctx, a, b, c) { return !eqCollate(ctx, a, b, c); }
function ltCollate(ctx, a, b, c) { return c.compare(a, b) < 0; }
function gtCollate(ctx, a, b, c) { return c.compare(a, b) > 0; }
function lteqCollate(ctx, a, b, c) { return c.compare(a, b) <= 0; }
function gteqCollate(ctx, a, b, c) { return c.compare(a, b) >= 0; }
/**
 * Special form for comparison operators, implementing the signatures:
 * - (T, T, ?Collator) => boolean
 * - (T, value, ?Collator) => boolean
 * - (value, T, ?Collator) => boolean
 *
 * For inequalities, T must be either value, string, or number. For ==/!=, it
 * can also be boolean or null.
 *
 * Equality semantics are equivalent to Javascript's strict equality (===/!==)
 * -- i.e., when the arguments' types don't match, == evaluates to false, != to
 * true.
 *
 * When types don't match in an ordering comparison, a runtime error is thrown.
 *
 * @private
 */
function makeComparison(op, compareBasic, compareWithCollator) {
    const isOrderComparison = op !== '==' && op !== '!=';
    return class Comparison {
        constructor(lhs, rhs, collator) {
            this.type = BooleanType;
            this.lhs = lhs;
            this.rhs = rhs;
            this.collator = collator;
            this.hasUntypedArgument = lhs.type.kind === 'value' || rhs.type.kind === 'value';
        }
        static parse(args, context) {
            if (args.length !== 3 && args.length !== 4)
                return context.error('Expected two or three arguments.');
            const op = args[0];
            let lhs = context.parse(args[1], 1, ValueType);
            if (!lhs)
                return null;
            if (!isComparableType(op, lhs.type)) {
                return context.concat(1).error(`"${op}" comparisons are not supported for type '${toString$1(lhs.type)}'.`);
            }
            let rhs = context.parse(args[2], 2, ValueType);
            if (!rhs)
                return null;
            if (!isComparableType(op, rhs.type)) {
                return context.concat(2).error(`"${op}" comparisons are not supported for type '${toString$1(rhs.type)}'.`);
            }
            if (lhs.type.kind !== rhs.type.kind &&
                lhs.type.kind !== 'value' &&
                rhs.type.kind !== 'value') {
                return context.error(`Cannot compare types '${toString$1(lhs.type)}' and '${toString$1(rhs.type)}'.`);
            }
            if (isOrderComparison) {
                // typing rules specific to less/greater than operators
                if (lhs.type.kind === 'value' && rhs.type.kind !== 'value') {
                    // (value, T)
                    lhs = new Assertion(rhs.type, [lhs]);
                }
                else if (lhs.type.kind !== 'value' && rhs.type.kind === 'value') {
                    // (T, value)
                    rhs = new Assertion(lhs.type, [rhs]);
                }
            }
            let collator = null;
            if (args.length === 4) {
                if (lhs.type.kind !== 'string' &&
                    rhs.type.kind !== 'string' &&
                    lhs.type.kind !== 'value' &&
                    rhs.type.kind !== 'value') {
                    return context.error('Cannot use collator to compare non-string types.');
                }
                collator = context.parse(args[3], 3, CollatorType);
                if (!collator)
                    return null;
            }
            return new Comparison(lhs, rhs, collator);
        }
        evaluate(ctx) {
            const lhs = this.lhs.evaluate(ctx);
            const rhs = this.rhs.evaluate(ctx);
            if (isOrderComparison && this.hasUntypedArgument) {
                const lt = typeOf(lhs);
                const rt = typeOf(rhs);
                // check that type is string or number, and equal
                if (lt.kind !== rt.kind || !(lt.kind === 'string' || lt.kind === 'number')) {
                    throw new RuntimeError(`Expected arguments for "${op}" to be (string, string) or (number, number), but found (${lt.kind}, ${rt.kind}) instead.`);
                }
            }
            if (this.collator && !isOrderComparison && this.hasUntypedArgument) {
                const lt = typeOf(lhs);
                const rt = typeOf(rhs);
                if (lt.kind !== 'string' || rt.kind !== 'string') {
                    return compareBasic(ctx, lhs, rhs);
                }
            }
            return this.collator ?
                compareWithCollator(ctx, lhs, rhs, this.collator.evaluate(ctx)) :
                compareBasic(ctx, lhs, rhs);
        }
        eachChild(fn) {
            fn(this.lhs);
            fn(this.rhs);
            if (this.collator) {
                fn(this.collator);
            }
        }
        outputDefined() {
            return true;
        }
    };
}
const Equals = makeComparison('==', eq, eqCollate);
const NotEquals = makeComparison('!=', neq, neqCollate);
const LessThan = makeComparison('<', lt, ltCollate);
const GreaterThan = makeComparison('>', gt, gtCollate);
const LessThanOrEqual = makeComparison('<=', lteq, lteqCollate);
const GreaterThanOrEqual = makeComparison('>=', gteq, gteqCollate);

class NumberFormat {
    constructor(number, locale, currency, minFractionDigits, maxFractionDigits) {
        this.type = StringType;
        this.number = number;
        this.locale = locale;
        this.currency = currency;
        this.minFractionDigits = minFractionDigits;
        this.maxFractionDigits = maxFractionDigits;
    }
    static parse(args, context) {
        if (args.length !== 3)
            return context.error('Expected two arguments.');
        const number = context.parse(args[1], 1, NumberType);
        if (!number)
            return null;
        const options = args[2];
        if (typeof options !== 'object' || Array.isArray(options))
            return context.error('NumberFormat options argument must be an object.');
        let locale = null;
        if (options['locale']) {
            locale = context.parse(options['locale'], 1, StringType);
            if (!locale)
                return null;
        }
        let currency = null;
        if (options['currency']) {
            currency = context.parse(options['currency'], 1, StringType);
            if (!currency)
                return null;
        }
        let minFractionDigits = null;
        if (options['min-fraction-digits']) {
            minFractionDigits = context.parse(options['min-fraction-digits'], 1, NumberType);
            if (!minFractionDigits)
                return null;
        }
        let maxFractionDigits = null;
        if (options['max-fraction-digits']) {
            maxFractionDigits = context.parse(options['max-fraction-digits'], 1, NumberType);
            if (!maxFractionDigits)
                return null;
        }
        return new NumberFormat(number, locale, currency, minFractionDigits, maxFractionDigits);
    }
    evaluate(ctx) {
        return new Intl.NumberFormat(this.locale ? this.locale.evaluate(ctx) : [], {
            style: this.currency ? 'currency' : 'decimal',
            currency: this.currency ? this.currency.evaluate(ctx) : undefined,
            minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(ctx) : undefined,
            maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(ctx) : undefined,
        }).format(this.number.evaluate(ctx));
    }
    eachChild(fn) {
        fn(this.number);
        if (this.locale) {
            fn(this.locale);
        }
        if (this.currency) {
            fn(this.currency);
        }
        if (this.minFractionDigits) {
            fn(this.minFractionDigits);
        }
        if (this.maxFractionDigits) {
            fn(this.maxFractionDigits);
        }
    }
    outputDefined() {
        return false;
    }
}

class FormatExpression {
    constructor(sections) {
        this.type = FormattedType;
        this.sections = sections;
    }
    static parse(args, context) {
        if (args.length < 2) {
            return context.error('Expected at least one argument.');
        }
        const firstArg = args[1];
        if (!Array.isArray(firstArg) && typeof firstArg === 'object') {
            return context.error('First argument must be an image or text section.');
        }
        const sections = [];
        let nextTokenMayBeObject = false;
        for (let i = 1; i <= args.length - 1; ++i) {
            const arg = args[i];
            if (nextTokenMayBeObject && typeof arg === 'object' && !Array.isArray(arg)) {
                nextTokenMayBeObject = false;
                let scale = null;
                if (arg['font-scale']) {
                    scale = context.parse(arg['font-scale'], 1, NumberType);
                    if (!scale)
                        return null;
                }
                let font = null;
                if (arg['text-font']) {
                    font = context.parse(arg['text-font'], 1, array$1(StringType));
                    if (!font)
                        return null;
                }
                let textColor = null;
                if (arg['text-color']) {
                    textColor = context.parse(arg['text-color'], 1, ColorType);
                    if (!textColor)
                        return null;
                }
                const lastExpression = sections[sections.length - 1];
                lastExpression.scale = scale;
                lastExpression.font = font;
                lastExpression.textColor = textColor;
            }
            else {
                const content = context.parse(args[i], 1, ValueType);
                if (!content)
                    return null;
                const kind = content.type.kind;
                if (kind !== 'string' && kind !== 'value' && kind !== 'null' && kind !== 'resolvedImage')
                    return context.error('Formatted text type must be \'string\', \'value\', \'image\' or \'null\'.');
                nextTokenMayBeObject = true;
                sections.push({ content, scale: null, font: null, textColor: null });
            }
        }
        return new FormatExpression(sections);
    }
    evaluate(ctx) {
        const evaluateSection = section => {
            const evaluatedContent = section.content.evaluate(ctx);
            if (typeOf(evaluatedContent) === ResolvedImageType) {
                return new FormattedSection('', evaluatedContent, null, null, null);
            }
            return new FormattedSection(toString(evaluatedContent), null, section.scale ? section.scale.evaluate(ctx) : null, section.font ? section.font.evaluate(ctx).join(',') : null, section.textColor ? section.textColor.evaluate(ctx) : null);
        };
        return new Formatted(this.sections.map(evaluateSection));
    }
    eachChild(fn) {
        for (const section of this.sections) {
            fn(section.content);
            if (section.scale) {
                fn(section.scale);
            }
            if (section.font) {
                fn(section.font);
            }
            if (section.textColor) {
                fn(section.textColor);
            }
        }
    }
    outputDefined() {
        // Technically the combinatoric set of all children
        // Usually, this.text will be undefined anyway
        return false;
    }
}

class ImageExpression {
    constructor(input) {
        this.type = ResolvedImageType;
        this.input = input;
    }
    static parse(args, context) {
        if (args.length !== 2) {
            return context.error('Expected two arguments.');
        }
        const name = context.parse(args[1], 1, StringType);
        if (!name)
            return context.error('No image name provided.');
        return new ImageExpression(name);
    }
    evaluate(ctx) {
        const evaluatedImageName = this.input.evaluate(ctx);
        const value = ResolvedImage.fromString(evaluatedImageName);
        if (value && ctx.availableImages)
            value.available = ctx.availableImages.indexOf(evaluatedImageName) > -1;
        return value;
    }
    eachChild(fn) {
        fn(this.input);
    }
    outputDefined() {
        // The output of image is determined by the list of available images in the evaluation context
        return false;
    }
}

class Length {
    constructor(input) {
        this.type = NumberType;
        this.input = input;
    }
    static parse(args, context) {
        if (args.length !== 2)
            return context.error(`Expected 1 argument, but found ${args.length - 1} instead.`);
        const input = context.parse(args[1], 1);
        if (!input)
            return null;
        if (input.type.kind !== 'array' && input.type.kind !== 'string' && input.type.kind !== 'value')
            return context.error(`Expected argument of type string or array, but found ${toString$1(input.type)} instead.`);
        return new Length(input);
    }
    evaluate(ctx) {
        const input = this.input.evaluate(ctx);
        if (typeof input === 'string') {
            return input.length;
        }
        else if (Array.isArray(input)) {
            return input.length;
        }
        else {
            throw new RuntimeError(`Expected value to be of type string or array, but found ${toString$1(typeOf(input))} instead.`);
        }
    }
    eachChild(fn) {
        fn(this.input);
    }
    outputDefined() {
        return false;
    }
}

const expressions = {
    // special forms
    '==': Equals,
    '!=': NotEquals,
    '>': GreaterThan,
    '<': LessThan,
    '>=': GreaterThanOrEqual,
    '<=': LessThanOrEqual,
    'array': Assertion,
    'at': At,
    'boolean': Assertion,
    'case': Case,
    'coalesce': Coalesce,
    'collator': CollatorExpression,
    'format': FormatExpression,
    'image': ImageExpression,
    'in': In,
    'index-of': IndexOf,
    'interpolate': Interpolate,
    'interpolate-hcl': Interpolate,
    'interpolate-lab': Interpolate,
    'length': Length,
    'let': Let,
    'literal': Literal,
    'match': Match,
    'number': Assertion,
    'number-format': NumberFormat,
    'object': Assertion,
    'slice': Slice,
    'step': Step,
    'string': Assertion,
    'to-boolean': Coercion,
    'to-color': Coercion,
    'to-number': Coercion,
    'to-string': Coercion,
    'var': Var,
    'within': Within
};
function rgba(ctx, [r, g, b, a]) {
    r = r.evaluate(ctx);
    g = g.evaluate(ctx);
    b = b.evaluate(ctx);
    const alpha = a ? a.evaluate(ctx) : 1;
    const error = validateRGBA(r, g, b, alpha);
    if (error)
        throw new RuntimeError(error);
    return new Color(r / 255, g / 255, b / 255, alpha, false);
}
function has(key, obj) {
    return key in obj;
}
function get(key, obj) {
    const v = obj[key];
    return typeof v === 'undefined' ? null : v;
}
function binarySearch(v, a, i, j) {
    while (i <= j) {
        const m = (i + j) >> 1;
        if (a[m] === v)
            return true;
        if (a[m] > v)
            j = m - 1;
        else
            i = m + 1;
    }
    return false;
}
function varargs(type) {
    return { type };
}
CompoundExpression.register(expressions, {
    'error': [
        ErrorType,
        [StringType],
        (ctx, [v]) => { throw new RuntimeError(v.evaluate(ctx)); }
    ],
    'typeof': [
        StringType,
        [ValueType],
        (ctx, [v]) => toString$1(typeOf(v.evaluate(ctx)))
    ],
    'to-rgba': [
        array$1(NumberType, 4),
        [ColorType],
        (ctx, [v]) => {
            const [r, g, b, a] = v.evaluate(ctx).rgb;
            return [r * 255, g * 255, b * 255, a];
        },
    ],
    'rgb': [
        ColorType,
        [NumberType, NumberType, NumberType],
        rgba
    ],
    'rgba': [
        ColorType,
        [NumberType, NumberType, NumberType, NumberType],
        rgba
    ],
    'has': {
        type: BooleanType,
        overloads: [
            [
                [StringType],
                (ctx, [key]) => has(key.evaluate(ctx), ctx.properties())
            ], [
                [StringType, ObjectType],
                (ctx, [key, obj]) => has(key.evaluate(ctx), obj.evaluate(ctx))
            ]
        ]
    },
    'get': {
        type: ValueType,
        overloads: [
            [
                [StringType],
                (ctx, [key]) => get(key.evaluate(ctx), ctx.properties())
            ], [
                [StringType, ObjectType],
                (ctx, [key, obj]) => get(key.evaluate(ctx), obj.evaluate(ctx))
            ]
        ]
    },
    'feature-state': [
        ValueType,
        [StringType],
        (ctx, [key]) => get(key.evaluate(ctx), ctx.featureState || {})
    ],
    'properties': [
        ObjectType,
        [],
        (ctx) => ctx.properties()
    ],
    'geometry-type': [
        StringType,
        [],
        (ctx) => ctx.geometryType()
    ],
    'id': [
        ValueType,
        [],
        (ctx) => ctx.id()
    ],
    'zoom': [
        NumberType,
        [],
        (ctx) => ctx.globals.zoom
    ],
    'heatmap-density': [
        NumberType,
        [],
        (ctx) => ctx.globals.heatmapDensity || 0
    ],
    'line-progress': [
        NumberType,
        [],
        (ctx) => ctx.globals.lineProgress || 0
    ],
    'accumulated': [
        ValueType,
        [],
        (ctx) => ctx.globals.accumulated === undefined ? null : ctx.globals.accumulated
    ],
    '+': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => {
            let result = 0;
            for (const arg of args) {
                result += arg.evaluate(ctx);
            }
            return result;
        }
    ],
    '*': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => {
            let result = 1;
            for (const arg of args) {
                result *= arg.evaluate(ctx);
            }
            return result;
        }
    ],
    '-': {
        type: NumberType,
        overloads: [
            [
                [NumberType, NumberType],
                (ctx, [a, b]) => a.evaluate(ctx) - b.evaluate(ctx)
            ], [
                [NumberType],
                (ctx, [a]) => -a.evaluate(ctx)
            ]
        ]
    },
    '/': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [a, b]) => a.evaluate(ctx) / b.evaluate(ctx)
    ],
    '%': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [a, b]) => a.evaluate(ctx) % b.evaluate(ctx)
    ],
    'ln2': [
        NumberType,
        [],
        () => Math.LN2
    ],
    'pi': [
        NumberType,
        [],
        () => Math.PI
    ],
    'e': [
        NumberType,
        [],
        () => Math.E
    ],
    '^': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [b, e]) => Math.pow(b.evaluate(ctx), e.evaluate(ctx))
    ],
    'sqrt': [
        NumberType,
        [NumberType],
        (ctx, [x]) => Math.sqrt(x.evaluate(ctx))
    ],
    'log10': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN10
    ],
    'ln': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.log(n.evaluate(ctx))
    ],
    'log2': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN2
    ],
    'sin': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.sin(n.evaluate(ctx))
    ],
    'cos': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.cos(n.evaluate(ctx))
    ],
    'tan': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.tan(n.evaluate(ctx))
    ],
    'asin': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.asin(n.evaluate(ctx))
    ],
    'acos': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.acos(n.evaluate(ctx))
    ],
    'atan': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.atan(n.evaluate(ctx))
    ],
    'min': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => Math.min(...args.map(arg => arg.evaluate(ctx)))
    ],
    'max': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => Math.max(...args.map(arg => arg.evaluate(ctx)))
    ],
    'abs': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.abs(n.evaluate(ctx))
    ],
    'round': [
        NumberType,
        [NumberType],
        (ctx, [n]) => {
            const v = n.evaluate(ctx);
            // Javascript's Math.round() rounds towards +Infinity for halfway
            // values, even when they're negative. It's more common to round
            // away from 0 (e.g., this is what python and C++ do)
            return v < 0 ? -Math.round(-v) : Math.round(v);
        }
    ],
    'floor': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.floor(n.evaluate(ctx))
    ],
    'ceil': [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.ceil(n.evaluate(ctx))
    ],
    'filter-==': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => ctx.properties()[k.value] === v.value
    ],
    'filter-id-==': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => ctx.id() === v.value
    ],
    'filter-type-==': [
        BooleanType,
        [StringType],
        (ctx, [v]) => ctx.geometryType() === v.value
    ],
    'filter-<': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a < b;
        }
    ],
    'filter-id-<': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a < b;
        }
    ],
    'filter->': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a > b;
        }
    ],
    'filter-id->': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a > b;
        }
    ],
    'filter-<=': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a <= b;
        }
    ],
    'filter-id-<=': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a <= b;
        }
    ],
    'filter->=': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a >= b;
        }
    ],
    'filter-id->=': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a >= b;
        }
    ],
    'filter-has': [
        BooleanType,
        [ValueType],
        (ctx, [k]) => k.value in ctx.properties()
    ],
    'filter-has-id': [
        BooleanType,
        [],
        (ctx) => (ctx.id() !== null && ctx.id() !== undefined)
    ],
    'filter-type-in': [
        BooleanType,
        [array$1(StringType)],
        (ctx, [v]) => v.value.indexOf(ctx.geometryType()) >= 0
    ],
    'filter-id-in': [
        BooleanType,
        [array$1(ValueType)],
        (ctx, [v]) => v.value.indexOf(ctx.id()) >= 0
    ],
    'filter-in-small': [
        BooleanType,
        [StringType, array$1(ValueType)],
        // assumes v is an array literal
        (ctx, [k, v]) => v.value.indexOf(ctx.properties()[k.value]) >= 0
    ],
    'filter-in-large': [
        BooleanType,
        [StringType, array$1(ValueType)],
        // assumes v is a array literal with values sorted in ascending order and of a single type
        (ctx, [k, v]) => binarySearch(ctx.properties()[k.value], v.value, 0, v.value.length - 1)
    ],
    'all': {
        type: BooleanType,
        overloads: [
            [
                [BooleanType, BooleanType],
                (ctx, [a, b]) => a.evaluate(ctx) && b.evaluate(ctx)
            ],
            [
                varargs(BooleanType),
                (ctx, args) => {
                    for (const arg of args) {
                        if (!arg.evaluate(ctx))
                            return false;
                    }
                    return true;
                }
            ]
        ]
    },
    'any': {
        type: BooleanType,
        overloads: [
            [
                [BooleanType, BooleanType],
                (ctx, [a, b]) => a.evaluate(ctx) || b.evaluate(ctx)
            ],
            [
                varargs(BooleanType),
                (ctx, args) => {
                    for (const arg of args) {
                        if (arg.evaluate(ctx))
                            return true;
                    }
                    return false;
                }
            ]
        ]
    },
    '!': [
        BooleanType,
        [BooleanType],
        (ctx, [b]) => !b.evaluate(ctx)
    ],
    'is-supported-script': [
        BooleanType,
        [StringType],
        // At parse time this will always return true, so we need to exclude this expression with isGlobalPropertyConstant
        (ctx, [s]) => {
            const isSupportedScript = ctx.globals && ctx.globals.isSupportedScript;
            if (isSupportedScript) {
                return isSupportedScript(s.evaluate(ctx));
            }
            return true;
        }
    ],
    'upcase': [
        StringType,
        [StringType],
        (ctx, [s]) => s.evaluate(ctx).toUpperCase()
    ],
    'downcase': [
        StringType,
        [StringType],
        (ctx, [s]) => s.evaluate(ctx).toLowerCase()
    ],
    'concat': [
        StringType,
        varargs(ValueType),
        (ctx, args) => args.map(arg => toString(arg.evaluate(ctx))).join('')
    ],
    'resolved-locale': [
        StringType,
        [CollatorType],
        (ctx, [collator]) => collator.evaluate(ctx).resolvedLocale()
    ]
});

function success(value) {
    return { result: 'success', value };
}
function error(value) {
    return { result: 'error', value };
}

function supportsPropertyExpression(spec) {
    return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
}
function supportsZoomExpression(spec) {
    return !!spec.expression && spec.expression.parameters.indexOf('zoom') > -1;
}
function supportsInterpolation(spec) {
    return !!spec.expression && spec.expression.interpolated;
}

function getType(val) {
    if (val instanceof Number) {
        return 'number';
    }
    else if (val instanceof String) {
        return 'string';
    }
    else if (val instanceof Boolean) {
        return 'boolean';
    }
    else if (Array.isArray(val)) {
        return 'array';
    }
    else if (val === null) {
        return 'null';
    }
    else {
        return typeof val;
    }
}

function isFunction(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

class StyleExpression {
    constructor(expression, propertySpec) {
        this.expression = expression;
        this._warningHistory = {};
        this._evaluator = new EvaluationContext();
        this._defaultValue = propertySpec ? getDefaultValue(propertySpec) : null;
        this._enumValues = propertySpec && propertySpec.type === 'enum' ? propertySpec.values : null;
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature;
        this._evaluator.featureState = featureState;
        this._evaluator.canonical = canonical;
        this._evaluator.availableImages = availableImages || null;
        this._evaluator.formattedSection = formattedSection;
        return this.expression.evaluate(this._evaluator);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature || null;
        this._evaluator.featureState = featureState || null;
        this._evaluator.canonical = canonical;
        this._evaluator.availableImages = availableImages || null;
        this._evaluator.formattedSection = formattedSection || null;
        try {
            const val = this.expression.evaluate(this._evaluator);
            // eslint-disable-next-line no-self-compare
            if (val === null || val === undefined || (typeof val === 'number' && val !== val)) {
                return this._defaultValue;
            }
            if (this._enumValues && !(val in this._enumValues)) {
                throw new RuntimeError(`Expected value to be one of ${Object.keys(this._enumValues).map(v => JSON.stringify(v)).join(', ')}, but found ${JSON.stringify(val)} instead.`);
            }
            return val;
        }
        catch (e) {
            if (!this._warningHistory[e.message]) {
                this._warningHistory[e.message] = true;
                if (typeof console !== 'undefined') {
                    console.warn(e.message);
                }
            }
            return this._defaultValue;
        }
    }
}
function isExpression(expression) {
    return Array.isArray(expression) && expression.length > 0 &&
        typeof expression[0] === 'string' && expression[0] in expressions;
}
/**
 * Parse and typecheck the given style spec JSON expression.  If
 * options.defaultValue is provided, then the resulting StyleExpression's
 * `evaluate()` method will handle errors by logging a warning (once per
 * message) and returning the default value.  Otherwise, it will throw
 * evaluation errors.
 *
 * @private
 */
function createExpression(expression, propertySpec) {
    const parser = new ParsingContext(expressions, isExpressionConstant, [], propertySpec ? getExpectedType(propertySpec) : undefined);
    // For string-valued properties, coerce to string at the top level rather than asserting.
    const parsed = parser.parse(expression, undefined, undefined, undefined, propertySpec && propertySpec.type === 'string' ? { typeAnnotation: 'coerce' } : undefined);
    if (!parsed) {
        return error(parser.errors);
    }
    return success(new StyleExpression(parsed, propertySpec));
}
class ZoomConstantExpression {
    constructor(kind, expression) {
        this.kind = kind;
        this._styleExpression = expression;
        this.isStateDependent = kind !== 'constant' && !isStateConstant(expression.expression);
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
}
class ZoomDependentExpression {
    constructor(kind, expression, zoomStops, interpolationType) {
        this.kind = kind;
        this.zoomStops = zoomStops;
        this._styleExpression = expression;
        this.isStateDependent = kind !== 'camera' && !isStateConstant(expression.expression);
        this.interpolationType = interpolationType;
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    interpolationFactor(input, lower, upper) {
        if (this.interpolationType) {
            return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
        }
        else {
            return 0;
        }
    }
}
function createPropertyExpression(expressionInput, propertySpec) {
    const expression = createExpression(expressionInput, propertySpec);
    if (expression.result === 'error') {
        return expression;
    }
    const parsed = expression.value.expression;
    const isFeatureConstantResult = isFeatureConstant(parsed);
    if (!isFeatureConstantResult && !supportsPropertyExpression(propertySpec)) {
        return error([new ExpressionParsingError('', 'data expressions not supported')]);
    }
    const isZoomConstant = isGlobalPropertyConstant(parsed, ['zoom']);
    if (!isZoomConstant && !supportsZoomExpression(propertySpec)) {
        return error([new ExpressionParsingError('', 'zoom expressions not supported')]);
    }
    const zoomCurve = findZoomCurve(parsed);
    if (!zoomCurve && !isZoomConstant) {
        return error([new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]);
    }
    else if (zoomCurve instanceof ExpressionParsingError) {
        return error([zoomCurve]);
    }
    else if (zoomCurve instanceof Interpolate && !supportsInterpolation(propertySpec)) {
        return error([new ExpressionParsingError('', '"interpolate" expressions cannot be used with this property')]);
    }
    if (!zoomCurve) {
        return success(isFeatureConstantResult ?
            new ZoomConstantExpression('constant', expression.value) :
            new ZoomConstantExpression('source', expression.value));
    }
    const interpolationType = zoomCurve instanceof Interpolate ? zoomCurve.interpolation : undefined;
    return success(isFeatureConstantResult ?
        new ZoomDependentExpression('camera', expression.value, zoomCurve.labels, interpolationType) :
        new ZoomDependentExpression('composite', expression.value, zoomCurve.labels, interpolationType));
}
// Zoom-dependent expressions may only use ["zoom"] as the input to a top-level "step" or "interpolate"
// expression (collectively referred to as a "curve"). The curve may be wrapped in one or more "let" or
// "coalesce" expressions.
function findZoomCurve(expression) {
    let result = null;
    if (expression instanceof Let) {
        result = findZoomCurve(expression.result);
    }
    else if (expression instanceof Coalesce) {
        for (const arg of expression.args) {
            result = findZoomCurve(arg);
            if (result) {
                break;
            }
        }
    }
    else if ((expression instanceof Step || expression instanceof Interpolate) &&
        expression.input instanceof CompoundExpression &&
        expression.input.name === 'zoom') {
        result = expression;
    }
    if (result instanceof ExpressionParsingError) {
        return result;
    }
    expression.eachChild((child) => {
        const childResult = findZoomCurve(child);
        if (childResult instanceof ExpressionParsingError) {
            result = childResult;
        }
        else if (!result && childResult) {
            result = new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.');
        }
        else if (result && childResult && result !== childResult) {
            result = new ExpressionParsingError('', 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.');
        }
    });
    return result;
}
function getExpectedType(spec) {
    const types = {
        color: ColorType,
        string: StringType,
        number: NumberType,
        enum: StringType,
        boolean: BooleanType,
        formatted: FormattedType,
        padding: PaddingType,
        resolvedImage: ResolvedImageType,
        variableAnchorOffsetCollection: VariableAnchorOffsetCollectionType
    };
    if (spec.type === 'array') {
        return array$1(types[spec.value] || ValueType, spec.length);
    }
    return types[spec.type];
}
function getDefaultValue(spec) {
    if (spec.type === 'color' && isFunction(spec.default)) {
        // Special case for heatmap-color: it uses the 'default:' to define a
        // default color ramp, but createExpression expects a simple value to fall
        // back to in case of runtime errors
        return new Color(0, 0, 0, 0);
    }
    else if (spec.type === 'color') {
        return Color.parse(spec.default) || null;
    }
    else if (spec.type === 'padding') {
        return Padding.parse(spec.default) || null;
    }
    else if (spec.type === 'variableAnchorOffsetCollection') {
        return VariableAnchorOffsetCollection.parse(spec.default) || null;
    }
    else if (spec.default === undefined) {
        return null;
    }
    else {
        return spec.default;
    }
}

function validateObject(options) {
    const key = options.key;
    const object = options.value;
    const elementSpecs = options.valueSpec || {};
    const elementValidators = options.objectElementValidators || {};
    const style = options.style;
    const styleSpec = options.styleSpec;
    const validateSpec = options.validateSpec;
    let errors = [];
    const type = getType(object);
    if (type !== 'object') {
        return [new ValidationError(key, object, `object expected, ${type} found`)];
    }
    for (const objectKey in object) {
        const elementSpecKey = objectKey.split('.')[0]; // treat 'paint.*' as 'paint'
        const elementSpec = elementSpecs[elementSpecKey] || elementSpecs['*'];
        let validateElement;
        if (elementValidators[elementSpecKey]) {
            validateElement = elementValidators[elementSpecKey];
        }
        else if (elementSpecs[elementSpecKey]) {
            validateElement = validateSpec;
        }
        else if (elementValidators['*']) {
            validateElement = elementValidators['*'];
        }
        else if (elementSpecs['*']) {
            validateElement = validateSpec;
        }
        else {
            errors.push(new ValidationError(key, object[objectKey], `unknown property "${objectKey}"`));
            continue;
        }
        errors = errors.concat(validateElement({
            key: (key ? `${key}.` : key) + objectKey,
            value: object[objectKey],
            valueSpec: elementSpec,
            style,
            styleSpec,
            object,
            objectKey,
            validateSpec,
        }, object));
    }
    for (const elementSpecKey in elementSpecs) {
        // Don't check `required` when there's a custom validator for that property.
        if (elementValidators[elementSpecKey]) {
            continue;
        }
        if (elementSpecs[elementSpecKey].required && elementSpecs[elementSpecKey]['default'] === undefined && object[elementSpecKey] === undefined) {
            errors.push(new ValidationError(key, object, `missing required property "${elementSpecKey}"`));
        }
    }
    return errors;
}

function validateArray(options) {
    const array = options.value;
    const arraySpec = options.valueSpec;
    const validateSpec = options.validateSpec;
    const style = options.style;
    const styleSpec = options.styleSpec;
    const key = options.key;
    const validateArrayElement = options.arrayElementValidator || validateSpec;
    if (getType(array) !== 'array') {
        return [new ValidationError(key, array, `array expected, ${getType(array)} found`)];
    }
    if (arraySpec.length && array.length !== arraySpec.length) {
        return [new ValidationError(key, array, `array length ${arraySpec.length} expected, length ${array.length} found`)];
    }
    if (arraySpec['min-length'] && array.length < arraySpec['min-length']) {
        return [new ValidationError(key, array, `array length at least ${arraySpec['min-length']} expected, length ${array.length} found`)];
    }
    let arrayElementSpec = {
        'type': arraySpec.value,
        'values': arraySpec.values
    };
    if (styleSpec.$version < 7) {
        arrayElementSpec['function'] = arraySpec.function;
    }
    if (getType(arraySpec.value) === 'object') {
        arrayElementSpec = arraySpec.value;
    }
    let errors = [];
    for (let i = 0; i < array.length; i++) {
        errors = errors.concat(validateArrayElement({
            array,
            arrayIndex: i,
            value: array[i],
            valueSpec: arrayElementSpec,
            validateSpec: options.validateSpec,
            style,
            styleSpec,
            key: `${key}[${i}]`
        }));
    }
    return errors;
}

function validateNumber(options) {
    const key = options.key;
    const value = options.value;
    const valueSpec = options.valueSpec;
    let type = getType(value);
    // eslint-disable-next-line no-self-compare
    if (type === 'number' && value !== value) {
        type = 'NaN';
    }
    if (type !== 'number') {
        return [new ValidationError(key, value, `number expected, ${type} found`)];
    }
    if ('minimum' in valueSpec && value < valueSpec.minimum) {
        return [new ValidationError(key, value, `${value} is less than the minimum value ${valueSpec.minimum}`)];
    }
    if ('maximum' in valueSpec && value > valueSpec.maximum) {
        return [new ValidationError(key, value, `${value} is greater than the maximum value ${valueSpec.maximum}`)];
    }
    return [];
}

function validateFunction(options) {
    const functionValueSpec = options.valueSpec;
    const functionType = unbundle(options.value.type);
    let stopKeyType;
    let stopDomainValues = {};
    let previousStopDomainValue;
    let previousStopDomainZoom;
    const isZoomFunction = functionType !== 'categorical' && options.value.property === undefined;
    const isPropertyFunction = !isZoomFunction;
    const isZoomAndPropertyFunction = getType(options.value.stops) === 'array' &&
        getType(options.value.stops[0]) === 'array' &&
        getType(options.value.stops[0][0]) === 'object';
    const errors = validateObject({
        key: options.key,
        value: options.value,
        valueSpec: options.styleSpec.function,
        validateSpec: options.validateSpec,
        style: options.style,
        styleSpec: options.styleSpec,
        objectElementValidators: {
            stops: validateFunctionStops,
            default: validateFunctionDefault
        }
    });
    if (functionType === 'identity' && isZoomFunction) {
        errors.push(new ValidationError(options.key, options.value, 'missing required property "property"'));
    }
    if (functionType !== 'identity' && !options.value.stops) {
        errors.push(new ValidationError(options.key, options.value, 'missing required property "stops"'));
    }
    if (functionType === 'exponential' && options.valueSpec.expression && !supportsInterpolation(options.valueSpec)) {
        errors.push(new ValidationError(options.key, options.value, 'exponential functions not supported'));
    }
    if (options.styleSpec.$version >= 8) {
        if (isPropertyFunction && !supportsPropertyExpression(options.valueSpec)) {
            errors.push(new ValidationError(options.key, options.value, 'property functions not supported'));
        }
        else if (isZoomFunction && !supportsZoomExpression(options.valueSpec)) {
            errors.push(new ValidationError(options.key, options.value, 'zoom functions not supported'));
        }
    }
    if ((functionType === 'categorical' || isZoomAndPropertyFunction) && options.value.property === undefined) {
        errors.push(new ValidationError(options.key, options.value, '"property" property is required'));
    }
    return errors;
    function validateFunctionStops(options) {
        if (functionType === 'identity') {
            return [new ValidationError(options.key, options.value, 'identity function may not have a "stops" property')];
        }
        let errors = [];
        const value = options.value;
        errors = errors.concat(validateArray({
            key: options.key,
            value,
            valueSpec: options.valueSpec,
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec: options.styleSpec,
            arrayElementValidator: validateFunctionStop
        }));
        if (getType(value) === 'array' && value.length === 0) {
            errors.push(new ValidationError(options.key, value, 'array must have at least one stop'));
        }
        return errors;
    }
    function validateFunctionStop(options) {
        let errors = [];
        const value = options.value;
        const key = options.key;
        if (getType(value) !== 'array') {
            return [new ValidationError(key, value, `array expected, ${getType(value)} found`)];
        }
        if (value.length !== 2) {
            return [new ValidationError(key, value, `array length 2 expected, length ${value.length} found`)];
        }
        if (isZoomAndPropertyFunction) {
            if (getType(value[0]) !== 'object') {
                return [new ValidationError(key, value, `object expected, ${getType(value[0])} found`)];
            }
            if (value[0].zoom === undefined) {
                return [new ValidationError(key, value, 'object stop key must have zoom')];
            }
            if (value[0].value === undefined) {
                return [new ValidationError(key, value, 'object stop key must have value')];
            }
            if (previousStopDomainZoom && previousStopDomainZoom > unbundle(value[0].zoom)) {
                return [new ValidationError(key, value[0].zoom, 'stop zoom values must appear in ascending order')];
            }
            if (unbundle(value[0].zoom) !== previousStopDomainZoom) {
                previousStopDomainZoom = unbundle(value[0].zoom);
                previousStopDomainValue = undefined;
                stopDomainValues = {};
            }
            errors = errors.concat(validateObject({
                key: `${key}[0]`,
                value: value[0],
                valueSpec: { zoom: {} },
                validateSpec: options.validateSpec,
                style: options.style,
                styleSpec: options.styleSpec,
                objectElementValidators: { zoom: validateNumber, value: validateStopDomainValue }
            }));
        }
        else {
            errors = errors.concat(validateStopDomainValue({
                key: `${key}[0]`,
                value: value[0],
                valueSpec: {},
                validateSpec: options.validateSpec,
                style: options.style,
                styleSpec: options.styleSpec
            }, value));
        }
        if (isExpression(deepUnbundle(value[1]))) {
            return errors.concat([new ValidationError(`${key}[1]`, value[1], 'expressions are not allowed in function stops.')]);
        }
        return errors.concat(options.validateSpec({
            key: `${key}[1]`,
            value: value[1],
            valueSpec: functionValueSpec,
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec: options.styleSpec
        }));
    }
    function validateStopDomainValue(options, stop) {
        const type = getType(options.value);
        const value = unbundle(options.value);
        const reportValue = options.value !== null ? options.value : stop;
        if (!stopKeyType) {
            stopKeyType = type;
        }
        else if (type !== stopKeyType) {
            return [new ValidationError(options.key, reportValue, `${type} stop domain type must match previous stop domain type ${stopKeyType}`)];
        }
        if (type !== 'number' && type !== 'string' && type !== 'boolean') {
            return [new ValidationError(options.key, reportValue, 'stop domain value must be a number, string, or boolean')];
        }
        if (type !== 'number' && functionType !== 'categorical') {
            let message = `number expected, ${type} found`;
            if (supportsPropertyExpression(functionValueSpec) && functionType === undefined) {
                message += '\nIf you intended to use a categorical function, specify `"type": "categorical"`.';
            }
            return [new ValidationError(options.key, reportValue, message)];
        }
        if (functionType === 'categorical' && type === 'number' && (!isFinite(value) || Math.floor(value) !== value)) {
            return [new ValidationError(options.key, reportValue, `integer expected, found ${value}`)];
        }
        if (functionType !== 'categorical' && type === 'number' && previousStopDomainValue !== undefined && value < previousStopDomainValue) {
            return [new ValidationError(options.key, reportValue, 'stop domain values must appear in ascending order')];
        }
        else {
            previousStopDomainValue = value;
        }
        if (functionType === 'categorical' && value in stopDomainValues) {
            return [new ValidationError(options.key, reportValue, 'stop domain values must be unique')];
        }
        else {
            stopDomainValues[value] = true;
        }
        return [];
    }
    function validateFunctionDefault(options) {
        return options.validateSpec({
            key: options.key,
            value: options.value,
            valueSpec: functionValueSpec,
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec: options.styleSpec
        });
    }
}

function validateExpression(options) {
    const expression = (options.expressionContext === 'property' ? createPropertyExpression : createExpression)(deepUnbundle(options.value), options.valueSpec);
    if (expression.result === 'error') {
        return expression.value.map((error) => {
            return new ValidationError(`${options.key}${error.key}`, options.value, error.message);
        });
    }
    const expressionObj = expression.value.expression || expression.value._styleExpression.expression;
    if (options.expressionContext === 'property' && (options.propertyKey === 'text-font') &&
        !expressionObj.outputDefined()) {
        return [new ValidationError(options.key, options.value, `Invalid data expression for "${options.propertyKey}". Output values must be contained as literals within the expression.`)];
    }
    if (options.expressionContext === 'property' && options.propertyType === 'layout' &&
        (!isStateConstant(expressionObj))) {
        return [new ValidationError(options.key, options.value, '"feature-state" data expressions are not supported with layout properties.')];
    }
    if (options.expressionContext === 'filter' && !isStateConstant(expressionObj)) {
        return [new ValidationError(options.key, options.value, '"feature-state" data expressions are not supported with filters.')];
    }
    if (options.expressionContext && options.expressionContext.indexOf('cluster') === 0) {
        if (!isGlobalPropertyConstant(expressionObj, ['zoom', 'feature-state'])) {
            return [new ValidationError(options.key, options.value, '"zoom" and "feature-state" expressions are not supported with cluster properties.')];
        }
        if (options.expressionContext === 'cluster-initial' && !isFeatureConstant(expressionObj)) {
            return [new ValidationError(options.key, options.value, 'Feature data expressions are not supported with initial expression part of cluster properties.')];
        }
    }
    return [];
}

function validateBoolean(options) {
    const value = options.value;
    const key = options.key;
    const type = getType(value);
    if (type !== 'boolean') {
        return [new ValidationError(key, value, `boolean expected, ${type} found`)];
    }
    return [];
}

function validateColor(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);
    if (type !== 'string') {
        return [new ValidationError(key, value, `color expected, ${type} found`)];
    }
    if (!Color.parse(String(value))) { // cast String object to string primitive
        return [new ValidationError(key, value, `color expected, "${value}" found`)];
    }
    return [];
}

function validateEnum(options) {
    const key = options.key;
    const value = options.value;
    const valueSpec = options.valueSpec;
    const errors = [];
    if (Array.isArray(valueSpec.values)) { // <=v7
        if (valueSpec.values.indexOf(unbundle(value)) === -1) {
            errors.push(new ValidationError(key, value, `expected one of [${valueSpec.values.join(', ')}], ${JSON.stringify(value)} found`));
        }
    }
    else { // >=v8
        if (Object.keys(valueSpec.values).indexOf(unbundle(value)) === -1) {
            errors.push(new ValidationError(key, value, `expected one of [${Object.keys(valueSpec.values).join(', ')}], ${JSON.stringify(value)} found`));
        }
    }
    return errors;
}

function isExpressionFilter(filter) {
    if (filter === true || filter === false) {
        return true;
    }
    if (!Array.isArray(filter) || filter.length === 0) {
        return false;
    }
    switch (filter[0]) {
        case 'has':
            return filter.length >= 2 && filter[1] !== '$id' && filter[1] !== '$type';
        case 'in':
            return filter.length >= 3 && (typeof filter[1] !== 'string' || Array.isArray(filter[2]));
        case '!in':
        case '!has':
        case 'none':
            return false;
        case '==':
        case '!=':
        case '>':
        case '>=':
        case '<':
        case '<=':
            return filter.length !== 3 || (Array.isArray(filter[1]) || Array.isArray(filter[2]));
        case 'any':
        case 'all':
            for (const f of filter.slice(1)) {
                if (!isExpressionFilter(f) && typeof f !== 'boolean') {
                    return false;
                }
            }
            return true;
        default:
            return true;
    }
}

function validateFilter(options) {
    if (isExpressionFilter(deepUnbundle(options.value))) {
        return validateExpression(extendBy({}, options, {
            expressionContext: 'filter',
            valueSpec: { value: 'boolean' }
        }));
    }
    else {
        return validateNonExpressionFilter(options);
    }
}
function validateNonExpressionFilter(options) {
    const value = options.value;
    const key = options.key;
    if (getType(value) !== 'array') {
        return [new ValidationError(key, value, `array expected, ${getType(value)} found`)];
    }
    const styleSpec = options.styleSpec;
    let type;
    let errors = [];
    if (value.length < 1) {
        return [new ValidationError(key, value, 'filter array must have at least 1 element')];
    }
    errors = errors.concat(validateEnum({
        key: `${key}[0]`,
        value: value[0],
        valueSpec: styleSpec.filter_operator,
        style: options.style,
        styleSpec: options.styleSpec
    }));
    switch (unbundle(value[0])) {
        case '<':
        case '<=':
        case '>':
        case '>=':
            if (value.length >= 2 && unbundle(value[1]) === '$type') {
                errors.push(new ValidationError(key, value, `"$type" cannot be use with operator "${value[0]}"`));
            }
        /* falls through */
        case '==':
        case '!=':
            if (value.length !== 3) {
                errors.push(new ValidationError(key, value, `filter array for operator "${value[0]}" must have 3 elements`));
            }
        /* falls through */
        case 'in':
        case '!in':
            if (value.length >= 2) {
                type = getType(value[1]);
                if (type !== 'string') {
                    errors.push(new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`));
                }
            }
            for (let i = 2; i < value.length; i++) {
                type = getType(value[i]);
                if (unbundle(value[1]) === '$type') {
                    errors = errors.concat(validateEnum({
                        key: `${key}[${i}]`,
                        value: value[i],
                        valueSpec: styleSpec.geometry_type,
                        style: options.style,
                        styleSpec: options.styleSpec
                    }));
                }
                else if (type !== 'string' && type !== 'number' && type !== 'boolean') {
                    errors.push(new ValidationError(`${key}[${i}]`, value[i], `string, number, or boolean expected, ${type} found`));
                }
            }
            break;
        case 'any':
        case 'all':
        case 'none':
            for (let i = 1; i < value.length; i++) {
                errors = errors.concat(validateNonExpressionFilter({
                    key: `${key}[${i}]`,
                    value: value[i],
                    style: options.style,
                    styleSpec: options.styleSpec
                }));
            }
            break;
        case 'has':
        case '!has':
            type = getType(value[1]);
            if (value.length !== 2) {
                errors.push(new ValidationError(key, value, `filter array for "${value[0]}" operator must have 2 elements`));
            }
            else if (type !== 'string') {
                errors.push(new ValidationError(`${key}[1]`, value[1], `string expected, ${type} found`));
            }
            break;
        case 'within':
            type = getType(value[1]);
            if (value.length !== 2) {
                errors.push(new ValidationError(key, value, `filter array for "${value[0]}" operator must have 2 elements`));
            }
            else if (type !== 'object') {
                errors.push(new ValidationError(`${key}[1]`, value[1], `object expected, ${type} found`));
            }
            break;
    }
    return errors;
}

function validateProperty(options, propertyType) {
    const key = options.key;
    const validateSpec = options.validateSpec;
    const style = options.style;
    const styleSpec = options.styleSpec;
    const value = options.value;
    const propertyKey = options.objectKey;
    const layerSpec = styleSpec[`${propertyType}_${options.layerType}`];
    if (!layerSpec)
        return [];
    const transitionMatch = propertyKey.match(/^(.*)-transition$/);
    if (propertyType === 'paint' && transitionMatch && layerSpec[transitionMatch[1]] && layerSpec[transitionMatch[1]].transition) {
        return validateSpec({
            key,
            value,
            valueSpec: styleSpec.transition,
            style,
            styleSpec
        });
    }
    const valueSpec = options.valueSpec || layerSpec[propertyKey];
    if (!valueSpec) {
        return [new ValidationError(key, value, `unknown property "${propertyKey}"`)];
    }
    let tokenMatch;
    if (getType(value) === 'string' && supportsPropertyExpression(valueSpec) && !valueSpec.tokens && (tokenMatch = /^{([^}]+)}$/.exec(value))) {
        return [new ValidationError(key, value, `"${propertyKey}" does not support interpolation syntax\n` +
                `Use an identity property function instead: \`{ "type": "identity", "property": ${JSON.stringify(tokenMatch[1])} }\`.`)];
    }
    const errors = [];
    if (options.layerType === 'symbol') {
        if (propertyKey === 'text-field' && style && !style.glyphs) {
            errors.push(new ValidationError(key, value, 'use of "text-field" requires a style "glyphs" property'));
        }
        if (propertyKey === 'text-font' && isFunction(deepUnbundle(value)) && unbundle(value.type) === 'identity') {
            errors.push(new ValidationError(key, value, '"text-font" does not support identity functions'));
        }
    }
    return errors.concat(validateSpec({
        key: options.key,
        value,
        valueSpec,
        style,
        styleSpec,
        expressionContext: 'property',
        propertyType,
        propertyKey
    }));
}

function validatePaintProperty(options) {
    return validateProperty(options, 'paint');
}

function validateLayoutProperty(options) {
    return validateProperty(options, 'layout');
}

function validateLayer(options) {
    let errors = [];
    const layer = options.value;
    const key = options.key;
    const style = options.style;
    const styleSpec = options.styleSpec;
    if (!layer.type && !layer.ref) {
        errors.push(new ValidationError(key, layer, 'either "type" or "ref" is required'));
    }
    let type = unbundle(layer.type);
    const ref = unbundle(layer.ref);
    if (layer.id) {
        const layerId = unbundle(layer.id);
        for (let i = 0; i < options.arrayIndex; i++) {
            const otherLayer = style.layers[i];
            if (unbundle(otherLayer.id) === layerId) {
                errors.push(new ValidationError(key, layer.id, `duplicate layer id "${layer.id}", previously used at line ${otherLayer.id.__line__}`));
            }
        }
    }
    if ('ref' in layer) {
        ['type', 'source', 'source-layer', 'filter', 'layout'].forEach((p) => {
            if (p in layer) {
                errors.push(new ValidationError(key, layer[p], `"${p}" is prohibited for ref layers`));
            }
        });
        let parent;
        style.layers.forEach((layer) => {
            if (unbundle(layer.id) === ref)
                parent = layer;
        });
        if (!parent) {
            errors.push(new ValidationError(key, layer.ref, `ref layer "${ref}" not found`));
        }
        else if (parent.ref) {
            errors.push(new ValidationError(key, layer.ref, 'ref cannot reference another ref layer'));
        }
        else {
            type = unbundle(parent.type);
        }
    }
    else if (type !== 'background') {
        if (!layer.source) {
            errors.push(new ValidationError(key, layer, 'missing required property "source"'));
        }
        else {
            const source = style.sources && style.sources[layer.source];
            const sourceType = source && unbundle(source.type);
            if (!source) {
                errors.push(new ValidationError(key, layer.source, `source "${layer.source}" not found`));
            }
            else if (sourceType === 'vector' && type === 'raster') {
                errors.push(new ValidationError(key, layer.source, `layer "${layer.id}" requires a raster source`));
            }
            else if (sourceType === 'raster' && type !== 'raster') {
                errors.push(new ValidationError(key, layer.source, `layer "${layer.id}" requires a vector source`));
            }
            else if (sourceType === 'vector' && !layer['source-layer']) {
                errors.push(new ValidationError(key, layer, `layer "${layer.id}" must specify a "source-layer"`));
            }
            else if (sourceType === 'raster-dem' && type !== 'hillshade') {
                errors.push(new ValidationError(key, layer.source, 'raster-dem source can only be used with layer type \'hillshade\'.'));
            }
            else if (type === 'line' && layer.paint && layer.paint['line-gradient'] &&
                (sourceType !== 'geojson' || !source.lineMetrics)) {
                errors.push(new ValidationError(key, layer, `layer "${layer.id}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`));
            }
        }
    }
    errors = errors.concat(validateObject({
        key,
        value: layer,
        valueSpec: styleSpec.layer,
        style: options.style,
        styleSpec: options.styleSpec,
        validateSpec: options.validateSpec,
        objectElementValidators: {
            '*'() {
                return [];
            },
            // We don't want to enforce the spec's `"requires": true` for backward compatibility with refs;
            // the actual requirement is validated above. See https://github.com/mapbox/mapbox-gl-js/issues/5772.
            type() {
                return options.validateSpec({
                    key: `${key}.type`,
                    value: layer.type,
                    valueSpec: styleSpec.layer.type,
                    style: options.style,
                    styleSpec: options.styleSpec,
                    validateSpec: options.validateSpec,
                    object: layer,
                    objectKey: 'type'
                });
            },
            filter: validateFilter,
            layout(options) {
                return validateObject({
                    layer,
                    key: options.key,
                    value: options.value,
                    style: options.style,
                    styleSpec: options.styleSpec,
                    validateSpec: options.validateSpec,
                    objectElementValidators: {
                        '*'(options) {
                            return validateLayoutProperty(extendBy({ layerType: type }, options));
                        }
                    }
                });
            },
            paint(options) {
                return validateObject({
                    layer,
                    key: options.key,
                    value: options.value,
                    style: options.style,
                    styleSpec: options.styleSpec,
                    validateSpec: options.validateSpec,
                    objectElementValidators: {
                        '*'(options) {
                            return validatePaintProperty(extendBy({ layerType: type }, options));
                        }
                    }
                });
            }
        }
    }));
    return errors;
}

function validateString(options) {
    const value = options.value;
    const key = options.key;
    const type = getType(value);
    if (type !== 'string') {
        return [new ValidationError(key, value, `string expected, ${type} found`)];
    }
    return [];
}

const objectElementValidators = {
    promoteId: validatePromoteId
};
function validateSource(options) {
    const value = options.value;
    const key = options.key;
    const styleSpec = options.styleSpec;
    const style = options.style;
    const validateSpec = options.validateSpec;
    if (!value.type) {
        return [new ValidationError(key, value, '"type" is required')];
    }
    const type = unbundle(value.type);
    let errors;
    switch (type) {
        case 'vector':
        case 'raster':
        case 'raster-dem':
            errors = validateObject({
                key,
                value,
                valueSpec: styleSpec[`source_${type.replace('-', '_')}`],
                style: options.style,
                styleSpec,
                objectElementValidators,
                validateSpec,
            });
            return errors;
        case 'geojson':
            errors = validateObject({
                key,
                value,
                valueSpec: styleSpec.source_geojson,
                style,
                styleSpec,
                validateSpec,
                objectElementValidators
            });
            if (value.cluster) {
                for (const prop in value.clusterProperties) {
                    const [operator, mapExpr] = value.clusterProperties[prop];
                    const reduceExpr = typeof operator === 'string' ? [operator, ['accumulated'], ['get', prop]] : operator;
                    errors.push(...validateExpression({
                        key: `${key}.${prop}.map`,
                        value: mapExpr,
                        validateSpec,
                        expressionContext: 'cluster-map'
                    }));
                    errors.push(...validateExpression({
                        key: `${key}.${prop}.reduce`,
                        value: reduceExpr,
                        validateSpec,
                        expressionContext: 'cluster-reduce'
                    }));
                }
            }
            return errors;
        case 'video':
            return validateObject({
                key,
                value,
                valueSpec: styleSpec.source_video,
                style,
                validateSpec,
                styleSpec
            });
        case 'image':
            return validateObject({
                key,
                value,
                valueSpec: styleSpec.source_image,
                style,
                validateSpec,
                styleSpec
            });
        case 'canvas':
            return [new ValidationError(key, null, 'Please use runtime APIs to add canvas sources, rather than including them in stylesheets.', 'source.canvas')];
        default:
            return validateEnum({
                key: `${key}.type`,
                value: value.type,
                valueSpec: { values: ['vector', 'raster', 'raster-dem', 'geojson', 'video', 'image'] },
                style,
                validateSpec,
                styleSpec
            });
    }
}
function validatePromoteId({ key, value }) {
    if (getType(value) === 'string') {
        return validateString({ key, value });
    }
    else {
        const errors = [];
        for (const prop in value) {
            errors.push(...validateString({ key: `${key}.${prop}`, value: value[prop] }));
        }
        return errors;
    }
}

function validateLight(options) {
    const light = options.value;
    const styleSpec = options.styleSpec;
    const lightSpec = styleSpec.light;
    const style = options.style;
    let errors = [];
    const rootType = getType(light);
    if (light === undefined) {
        return errors;
    }
    else if (rootType !== 'object') {
        errors = errors.concat([new ValidationError('light', light, `object expected, ${rootType} found`)]);
        return errors;
    }
    for (const key in light) {
        const transitionMatch = key.match(/^(.*)-transition$/);
        if (transitionMatch && lightSpec[transitionMatch[1]] && lightSpec[transitionMatch[1]].transition) {
            errors = errors.concat(options.validateSpec({
                key,
                value: light[key],
                valueSpec: styleSpec.transition,
                validateSpec: options.validateSpec,
                style,
                styleSpec
            }));
        }
        else if (lightSpec[key]) {
            errors = errors.concat(options.validateSpec({
                key,
                value: light[key],
                valueSpec: lightSpec[key],
                validateSpec: options.validateSpec,
                style,
                styleSpec
            }));
        }
        else {
            errors = errors.concat([new ValidationError(key, light[key], `unknown property "${key}"`)]);
        }
    }
    return errors;
}

function validateTerrain(options) {
    const terrain = options.value;
    const styleSpec = options.styleSpec;
    const terrainSpec = styleSpec.terrain;
    const style = options.style;
    let errors = [];
    const rootType = getType(terrain);
    if (terrain === undefined) {
        return errors;
    }
    else if (rootType !== 'object') {
        errors = errors.concat([new ValidationError('terrain', terrain, `object expected, ${rootType} found`)]);
        return errors;
    }
    for (const key in terrain) {
        if (terrainSpec[key]) {
            errors = errors.concat(options.validateSpec({
                key,
                value: terrain[key],
                valueSpec: terrainSpec[key],
                validateSpec: options.validateSpec,
                style,
                styleSpec
            }));
        }
        else {
            errors = errors.concat([new ValidationError(key, terrain[key], `unknown property "${key}"`)]);
        }
    }
    return errors;
}

function validateFormatted(options) {
    if (validateString(options).length === 0) {
        return [];
    }
    return validateExpression(options);
}

function validateImage(options) {
    if (validateString(options).length === 0) {
        return [];
    }
    return validateExpression(options);
}

function validatePadding(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);
    if (type === 'array') {
        if (value.length < 1 || value.length > 4) {
            return [new ValidationError(key, value, `padding requires 1 to 4 values; ${value.length} values found`)];
        }
        const arrayElementSpec = {
            type: 'number'
        };
        let errors = [];
        for (let i = 0; i < value.length; i++) {
            errors = errors.concat(options.validateSpec({
                key: `${key}[${i}]`,
                value: value[i],
                validateSpec: options.validateSpec,
                valueSpec: arrayElementSpec
            }));
        }
        return errors;
    }
    else {
        return validateNumber({
            key,
            value,
            valueSpec: {}
        });
    }
}

function validateVariableAnchorOffsetCollection(options) {
    const key = options.key;
    const value = options.value;
    const type = getType(value);
    const styleSpec = options.styleSpec;
    if (type !== 'array' || value.length < 1 || value.length % 2 !== 0) {
        return [new ValidationError(key, value, 'variableAnchorOffsetCollection requires a non-empty array of even length')];
    }
    let errors = [];
    for (let i = 0; i < value.length; i += 2) {
        // Elements in even positions should be values from text-anchor enum
        errors = errors.concat(validateEnum({
            key: `${key}[${i}]`,
            value: value[i],
            valueSpec: styleSpec['layout_symbol']['text-anchor']
        }));
        // Elements in odd positions should be points (2-element numeric arrays)
        errors = errors.concat(validateArray({
            key: `${key}[${i + 1}]`,
            value: value[i + 1],
            valueSpec: {
                length: 2,
                value: 'number'
            },
            validateSpec: options.validateSpec,
            style: options.style,
            styleSpec
        }));
    }
    return errors;
}

function validateSprite(options) {
    let errors = [];
    const sprite = options.value;
    const key = options.key;
    if (!Array.isArray(sprite)) {
        return validateString({
            key,
            value: sprite
        });
    }
    else {
        const allSpriteIds = [];
        const allSpriteURLs = [];
        for (const i in sprite) {
            if (sprite[i].id && allSpriteIds.includes(sprite[i].id))
                errors.push(new ValidationError(key, sprite, `all the sprites' ids must be unique, but ${sprite[i].id} is duplicated`));
            allSpriteIds.push(sprite[i].id);
            if (sprite[i].url && allSpriteURLs.includes(sprite[i].url))
                errors.push(new ValidationError(key, sprite, `all the sprites' URLs must be unique, but ${sprite[i].url} is duplicated`));
            allSpriteURLs.push(sprite[i].url);
            const pairSpec = {
                id: {
                    type: 'string',
                    required: true,
                },
                url: {
                    type: 'string',
                    required: true,
                }
            };
            errors = errors.concat(validateObject({
                key: `${key}[${i}]`,
                value: sprite[i],
                valueSpec: pairSpec,
                validateSpec: options.validateSpec,
            }));
        }
        return errors;
    }
}

const VALIDATORS = {
    '*'() {
        return [];
    },
    'array': validateArray,
    'boolean': validateBoolean,
    'number': validateNumber,
    'color': validateColor,
    'constants': validateConstants,
    'enum': validateEnum,
    'filter': validateFilter,
    'function': validateFunction,
    'layer': validateLayer,
    'object': validateObject,
    'source': validateSource,
    'light': validateLight,
    'terrain': validateTerrain,
    'string': validateString,
    'formatted': validateFormatted,
    'resolvedImage': validateImage,
    'padding': validatePadding,
    'variableAnchorOffsetCollection': validateVariableAnchorOffsetCollection,
    'sprite': validateSprite,
};
// Main recursive validation function. Tracks:
//
// - key: string representing location of validation in style tree. Used only
//   for more informative error reporting.
// - value: current value from style being evaluated. May be anything from a
//   high level object that needs to be descended into deeper or a simple
//   scalar value.
// - valueSpec: current spec being evaluated. Tracks value.
// - styleSpec: current full spec being evaluated.
function validate(options) {
    const value = options.value;
    const valueSpec = options.valueSpec;
    const styleSpec = options.styleSpec;
    options.validateSpec = validate;
    if (valueSpec.expression && isFunction(unbundle(value))) {
        return validateFunction(options);
    }
    else if (valueSpec.expression && isExpression(deepUnbundle(value))) {
        return validateExpression(options);
    }
    else if (valueSpec.type && VALIDATORS[valueSpec.type]) {
        return VALIDATORS[valueSpec.type](options);
    }
    else {
        const valid = validateObject(extendBy({}, options, {
            valueSpec: valueSpec.type ? styleSpec[valueSpec.type] : valueSpec
        }));
        return valid;
    }
}

var $version = 8;
var $root = {
	version: {
		required: true,
		type: "enum",
		values: [
			8
		]
	},
	name: {
		type: "string"
	},
	metadata: {
		type: "*"
	},
	center: {
		type: "array",
		value: "number"
	},
	zoom: {
		type: "number"
	},
	bearing: {
		type: "number",
		"default": 0,
		period: 360,
		units: "degrees"
	},
	pitch: {
		type: "number",
		"default": 0,
		units: "degrees"
	},
	light: {
		type: "light"
	},
	terrain: {
		type: "terrain"
	},
	sources: {
		required: true,
		type: "sources"
	},
	sprite: {
		type: "sprite"
	},
	glyphs: {
		type: "string"
	},
	transition: {
		type: "transition"
	},
	layers: {
		required: true,
		type: "array",
		value: "layer"
	}
};
var sources = {
	"*": {
		type: "source"
	}
};
var source = [
	"source_vector",
	"source_raster",
	"source_raster_dem",
	"source_geojson",
	"source_video",
	"source_image"
];
var source_vector = {
	type: {
		required: true,
		type: "enum",
		values: {
			vector: {
			}
		}
	},
	url: {
		type: "string"
	},
	tiles: {
		type: "array",
		value: "string"
	},
	bounds: {
		type: "array",
		value: "number",
		length: 4,
		"default": [
			-180,
			-85.051129,
			180,
			85.051129
		]
	},
	scheme: {
		type: "enum",
		values: {
			xyz: {
			},
			tms: {
			}
		},
		"default": "xyz"
	},
	minzoom: {
		type: "number",
		"default": 0
	},
	maxzoom: {
		type: "number",
		"default": 22
	},
	attribution: {
		type: "string"
	},
	promoteId: {
		type: "promoteId"
	},
	volatile: {
		type: "boolean",
		"default": false
	},
	"*": {
		type: "*"
	}
};
var source_raster = {
	type: {
		required: true,
		type: "enum",
		values: {
			raster: {
			}
		}
	},
	url: {
		type: "string"
	},
	tiles: {
		type: "array",
		value: "string"
	},
	bounds: {
		type: "array",
		value: "number",
		length: 4,
		"default": [
			-180,
			-85.051129,
			180,
			85.051129
		]
	},
	minzoom: {
		type: "number",
		"default": 0
	},
	maxzoom: {
		type: "number",
		"default": 22
	},
	tileSize: {
		type: "number",
		"default": 512,
		units: "pixels"
	},
	scheme: {
		type: "enum",
		values: {
			xyz: {
			},
			tms: {
			}
		},
		"default": "xyz"
	},
	attribution: {
		type: "string"
	},
	volatile: {
		type: "boolean",
		"default": false
	},
	"*": {
		type: "*"
	}
};
var source_raster_dem = {
	type: {
		required: true,
		type: "enum",
		values: {
			"raster-dem": {
			}
		}
	},
	url: {
		type: "string"
	},
	tiles: {
		type: "array",
		value: "string"
	},
	bounds: {
		type: "array",
		value: "number",
		length: 4,
		"default": [
			-180,
			-85.051129,
			180,
			85.051129
		]
	},
	minzoom: {
		type: "number",
		"default": 0
	},
	maxzoom: {
		type: "number",
		"default": 22
	},
	tileSize: {
		type: "number",
		"default": 512,
		units: "pixels"
	},
	attribution: {
		type: "string"
	},
	encoding: {
		type: "enum",
		values: {
			terrarium: {
			},
			mapbox: {
			},
			custom: {
			}
		},
		"default": "mapbox"
	},
	redMix: {
		type: "number",
		"default": 1
	},
	blueMix: {
		type: "number",
		"default": 1
	},
	greenMix: {
		type: "number",
		"default": 1
	},
	volatile: {
		type: "boolean",
		"default": false
	},
	"*": {
		type: "*"
	}
};
var source_geojson = {
	type: {
		required: true,
		type: "enum",
		values: {
			geojson: {
			}
		}
	},
	data: {
		required: true,
		type: "*"
	},
	maxzoom: {
		type: "number",
		"default": 18
	},
	attribution: {
		type: "string"
	},
	buffer: {
		type: "number",
		"default": 128,
		maximum: 512,
		minimum: 0
	},
	filter: {
		type: "*"
	},
	tolerance: {
		type: "number",
		"default": 0.375
	},
	cluster: {
		type: "boolean",
		"default": false
	},
	clusterRadius: {
		type: "number",
		"default": 50,
		minimum: 0
	},
	clusterMaxZoom: {
		type: "number"
	},
	clusterMinPoints: {
		type: "number"
	},
	clusterProperties: {
		type: "*"
	},
	lineMetrics: {
		type: "boolean",
		"default": false
	},
	generateId: {
		type: "boolean",
		"default": false
	},
	promoteId: {
		type: "promoteId"
	}
};
var source_video = {
	type: {
		required: true,
		type: "enum",
		values: {
			video: {
			}
		}
	},
	urls: {
		required: true,
		type: "array",
		value: "string"
	},
	coordinates: {
		required: true,
		type: "array",
		length: 4,
		value: {
			type: "array",
			length: 2,
			value: "number"
		}
	}
};
var source_image = {
	type: {
		required: true,
		type: "enum",
		values: {
			image: {
			}
		}
	},
	url: {
		required: true,
		type: "string"
	},
	coordinates: {
		required: true,
		type: "array",
		length: 4,
		value: {
			type: "array",
			length: 2,
			value: "number"
		}
	}
};
var layer = {
	id: {
		type: "string",
		required: true
	},
	type: {
		type: "enum",
		values: {
			fill: {
			},
			line: {
			},
			symbol: {
			},
			circle: {
			},
			heatmap: {
			},
			"fill-extrusion": {
			},
			raster: {
			},
			hillshade: {
			},
			background: {
			}
		},
		required: true
	},
	metadata: {
		type: "*"
	},
	source: {
		type: "string"
	},
	"source-layer": {
		type: "string"
	},
	minzoom: {
		type: "number",
		minimum: 0,
		maximum: 24
	},
	maxzoom: {
		type: "number",
		minimum: 0,
		maximum: 24
	},
	filter: {
		type: "filter"
	},
	layout: {
		type: "layout"
	},
	paint: {
		type: "paint"
	}
};
var layout = [
	"layout_fill",
	"layout_line",
	"layout_circle",
	"layout_heatmap",
	"layout_fill-extrusion",
	"layout_symbol",
	"layout_raster",
	"layout_hillshade",
	"layout_background"
];
var layout_background = {
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_fill = {
	"fill-sort-key": {
		type: "number",
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_circle = {
	"circle-sort-key": {
		type: "number",
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_heatmap = {
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_line = {
	"line-cap": {
		type: "enum",
		values: {
			butt: {
			},
			round: {
			},
			square: {
			}
		},
		"default": "butt",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"line-join": {
		type: "enum",
		values: {
			bevel: {
			},
			round: {
			},
			miter: {
			}
		},
		"default": "miter",
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"line-miter-limit": {
		type: "number",
		"default": 2,
		requires: [
			{
				"line-join": "miter"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"line-round-limit": {
		type: "number",
		"default": 1.05,
		requires: [
			{
				"line-join": "round"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"line-sort-key": {
		type: "number",
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_symbol = {
	"symbol-placement": {
		type: "enum",
		values: {
			point: {
			},
			line: {
			},
			"line-center": {
			}
		},
		"default": "point",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"symbol-spacing": {
		type: "number",
		"default": 250,
		minimum: 1,
		units: "pixels",
		requires: [
			{
				"symbol-placement": "line"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"symbol-avoid-edges": {
		type: "boolean",
		"default": false,
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"symbol-sort-key": {
		type: "number",
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"symbol-z-order": {
		type: "enum",
		values: {
			auto: {
			},
			"viewport-y": {
			},
			source: {
			}
		},
		"default": "auto",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-allow-overlap": {
		type: "boolean",
		"default": false,
		requires: [
			"icon-image",
			{
				"!": "icon-overlap"
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-overlap": {
		type: "enum",
		values: {
			never: {
			},
			always: {
			},
			cooperative: {
			}
		},
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-ignore-placement": {
		type: "boolean",
		"default": false,
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-optional": {
		type: "boolean",
		"default": false,
		requires: [
			"icon-image",
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-rotation-alignment": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			},
			auto: {
			}
		},
		"default": "auto",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-size": {
		type: "number",
		"default": 1,
		minimum: 0,
		units: "factor of the original icon size",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-text-fit": {
		type: "enum",
		values: {
			none: {
			},
			width: {
			},
			height: {
			},
			both: {
			}
		},
		"default": "none",
		requires: [
			"icon-image",
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-text-fit-padding": {
		type: "array",
		value: "number",
		length: 4,
		"default": [
			0,
			0,
			0,
			0
		],
		units: "pixels",
		requires: [
			"icon-image",
			"text-field",
			{
				"icon-text-fit": [
					"both",
					"width",
					"height"
				]
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-image": {
		type: "resolvedImage",
		tokens: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-rotate": {
		type: "number",
		"default": 0,
		period: 360,
		units: "degrees",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-padding": {
		type: "padding",
		"default": [
			2
		],
		units: "pixels",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-keep-upright": {
		type: "boolean",
		"default": false,
		requires: [
			"icon-image",
			{
				"icon-rotation-alignment": "map"
			},
			{
				"symbol-placement": [
					"line",
					"line-center"
				]
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-offset": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-anchor": {
		type: "enum",
		values: {
			center: {
			},
			left: {
			},
			right: {
			},
			top: {
			},
			bottom: {
			},
			"top-left": {
			},
			"top-right": {
			},
			"bottom-left": {
			},
			"bottom-right": {
			}
		},
		"default": "center",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"icon-pitch-alignment": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			},
			auto: {
			}
		},
		"default": "auto",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-pitch-alignment": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			},
			auto: {
			}
		},
		"default": "auto",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-rotation-alignment": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			},
			"viewport-glyph": {
			},
			auto: {
			}
		},
		"default": "auto",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-field": {
		type: "formatted",
		"default": "",
		tokens: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-font": {
		type: "array",
		value: "string",
		"default": [
			"Open Sans Regular",
			"Arial Unicode MS Regular"
		],
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-size": {
		type: "number",
		"default": 16,
		minimum: 0,
		units: "pixels",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-max-width": {
		type: "number",
		"default": 10,
		minimum: 0,
		units: "ems",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-line-height": {
		type: "number",
		"default": 1.2,
		units: "ems",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-letter-spacing": {
		type: "number",
		"default": 0,
		units: "ems",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-justify": {
		type: "enum",
		values: {
			auto: {
			},
			left: {
			},
			center: {
			},
			right: {
			}
		},
		"default": "center",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-radial-offset": {
		type: "number",
		units: "ems",
		"default": 0,
		requires: [
			"text-field"
		],
		"property-type": "data-driven",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		}
	},
	"text-variable-anchor": {
		type: "array",
		value: "enum",
		values: {
			center: {
			},
			left: {
			},
			right: {
			},
			top: {
			},
			bottom: {
			},
			"top-left": {
			},
			"top-right": {
			},
			"bottom-left": {
			},
			"bottom-right": {
			}
		},
		requires: [
			"text-field",
			{
				"symbol-placement": [
					"point"
				]
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-variable-anchor-offset": {
		type: "variableAnchorOffsetCollection",
		requires: [
			"text-field",
			{
				"symbol-placement": [
					"point"
				]
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-anchor": {
		type: "enum",
		values: {
			center: {
			},
			left: {
			},
			right: {
			},
			top: {
			},
			bottom: {
			},
			"top-left": {
			},
			"top-right": {
			},
			"bottom-left": {
			},
			"bottom-right": {
			}
		},
		"default": "center",
		requires: [
			"text-field",
			{
				"!": "text-variable-anchor"
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-max-angle": {
		type: "number",
		"default": 45,
		units: "degrees",
		requires: [
			"text-field",
			{
				"symbol-placement": [
					"line",
					"line-center"
				]
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-writing-mode": {
		type: "array",
		value: "enum",
		values: {
			horizontal: {
			},
			vertical: {
			}
		},
		requires: [
			"text-field",
			{
				"symbol-placement": [
					"point"
				]
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-rotate": {
		type: "number",
		"default": 0,
		period: 360,
		units: "degrees",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-padding": {
		type: "number",
		"default": 2,
		minimum: 0,
		units: "pixels",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-keep-upright": {
		type: "boolean",
		"default": true,
		requires: [
			"text-field",
			{
				"text-rotation-alignment": "map"
			},
			{
				"symbol-placement": [
					"line",
					"line-center"
				]
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-transform": {
		type: "enum",
		values: {
			none: {
			},
			uppercase: {
			},
			lowercase: {
			}
		},
		"default": "none",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-offset": {
		type: "array",
		value: "number",
		units: "ems",
		length: 2,
		"default": [
			0,
			0
		],
		requires: [
			"text-field",
			{
				"!": "text-radial-offset"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "data-driven"
	},
	"text-allow-overlap": {
		type: "boolean",
		"default": false,
		requires: [
			"text-field",
			{
				"!": "text-overlap"
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-overlap": {
		type: "enum",
		values: {
			never: {
			},
			always: {
			},
			cooperative: {
			}
		},
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-ignore-placement": {
		type: "boolean",
		"default": false,
		requires: [
			"text-field"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-optional": {
		type: "boolean",
		"default": false,
		requires: [
			"text-field",
			"icon-image"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_raster = {
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var layout_hillshade = {
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
};
var filter = {
	type: "array",
	value: "*"
};
var filter_operator = {
	type: "enum",
	values: {
		"==": {
		},
		"!=": {
		},
		">": {
		},
		">=": {
		},
		"<": {
		},
		"<=": {
		},
		"in": {
		},
		"!in": {
		},
		all: {
		},
		any: {
		},
		none: {
		},
		has: {
		},
		"!has": {
		},
		within: {
		}
	}
};
var geometry_type = {
	type: "enum",
	values: {
		Point: {
		},
		LineString: {
		},
		Polygon: {
		}
	}
};
var function_stop = {
	type: "array",
	minimum: 0,
	maximum: 24,
	value: [
		"number",
		"color"
	],
	length: 2
};
var expression = {
	type: "array",
	value: "*",
	minimum: 1
};
var light = {
	anchor: {
		type: "enum",
		"default": "viewport",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"property-type": "data-constant",
		transition: false,
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		}
	},
	position: {
		type: "array",
		"default": [
			1.15,
			210,
			30
		],
		length: 3,
		value: "number",
		"property-type": "data-constant",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		}
	},
	color: {
		type: "color",
		"property-type": "data-constant",
		"default": "#ffffff",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		transition: true
	},
	intensity: {
		type: "number",
		"property-type": "data-constant",
		"default": 0.5,
		minimum: 0,
		maximum: 1,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		transition: true
	}
};
var terrain = {
	source: {
		type: "string",
		required: true
	},
	exaggeration: {
		type: "number",
		minimum: 0,
		"default": 1
	}
};
var paint = [
	"paint_fill",
	"paint_line",
	"paint_circle",
	"paint_heatmap",
	"paint_fill-extrusion",
	"paint_symbol",
	"paint_raster",
	"paint_hillshade",
	"paint_background"
];
var paint_fill = {
	"fill-antialias": {
		type: "boolean",
		"default": true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		requires: [
			{
				"!": "fill-pattern"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-outline-color": {
		type: "color",
		transition: true,
		requires: [
			{
				"!": "fill-pattern"
			},
			{
				"fill-antialias": true
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"fill-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-pattern": {
		type: "resolvedImage",
		transition: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "cross-faded-data-driven"
	}
};
var paint_line = {
	"line-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		requires: [
			{
				"!": "line-pattern"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"line-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"line-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"line-width": {
		type: "number",
		"default": 1,
		minimum: 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-gap-width": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-offset": {
		type: "number",
		"default": 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-blur": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"line-dasharray": {
		type: "array",
		value: "number",
		minimum: 0,
		transition: true,
		units: "line widths",
		requires: [
			{
				"!": "line-pattern"
			}
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "cross-faded"
	},
	"line-pattern": {
		type: "resolvedImage",
		transition: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "cross-faded-data-driven"
	},
	"line-gradient": {
		type: "color",
		transition: false,
		requires: [
			{
				"!": "line-dasharray"
			},
			{
				"!": "line-pattern"
			},
			{
				source: "geojson",
				has: {
					lineMetrics: true
				}
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"line-progress"
			]
		},
		"property-type": "color-ramp"
	}
};
var paint_circle = {
	"circle-radius": {
		type: "number",
		"default": 5,
		minimum: 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-blur": {
		type: "number",
		"default": 0,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"circle-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"circle-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"circle-pitch-scale": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"circle-pitch-alignment": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "viewport",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"circle-stroke-width": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-stroke-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"circle-stroke-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	}
};
var paint_heatmap = {
	"heatmap-radius": {
		type: "number",
		"default": 30,
		minimum: 1,
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"heatmap-weight": {
		type: "number",
		"default": 1,
		minimum: 0,
		transition: false,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"heatmap-intensity": {
		type: "number",
		"default": 1,
		minimum: 0,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"heatmap-color": {
		type: "color",
		"default": [
			"interpolate",
			[
				"linear"
			],
			[
				"heatmap-density"
			],
			0,
			"rgba(0, 0, 255, 0)",
			0.1,
			"royalblue",
			0.3,
			"cyan",
			0.5,
			"lime",
			0.7,
			"yellow",
			1,
			"red"
		],
		transition: false,
		expression: {
			interpolated: true,
			parameters: [
				"heatmap-density"
			]
		},
		"property-type": "color-ramp"
	},
	"heatmap-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
};
var paint_symbol = {
	"icon-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"icon-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"icon-halo-color": {
		type: "color",
		"default": "rgba(0, 0, 0, 0)",
		transition: true,
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"icon-halo-width": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"icon-halo-blur": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"icon-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		requires: [
			"icon-image"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"icon-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"icon-image",
			"icon-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"text-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		overridable: true,
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"text-halo-color": {
		type: "color",
		"default": "rgba(0, 0, 0, 0)",
		transition: true,
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"text-halo-width": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"text-halo-blur": {
		type: "number",
		"default": 0,
		minimum: 0,
		transition: true,
		units: "pixels",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"text-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		requires: [
			"text-field"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"text-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"text-field",
			"text-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
};
var paint_raster = {
	"raster-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-hue-rotate": {
		type: "number",
		"default": 0,
		period: 360,
		transition: true,
		units: "degrees",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-brightness-min": {
		type: "number",
		"default": 0,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-brightness-max": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-saturation": {
		type: "number",
		"default": 0,
		minimum: -1,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-contrast": {
		type: "number",
		"default": 0,
		minimum: -1,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-resampling": {
		type: "enum",
		values: {
			linear: {
			},
			nearest: {
			}
		},
		"default": "linear",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"raster-fade-duration": {
		type: "number",
		"default": 300,
		minimum: 0,
		transition: false,
		units: "milliseconds",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
};
var paint_hillshade = {
	"hillshade-illumination-direction": {
		type: "number",
		"default": 335,
		minimum: 0,
		maximum: 359,
		transition: false,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"hillshade-illumination-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "viewport",
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"hillshade-exaggeration": {
		type: "number",
		"default": 0.5,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"hillshade-shadow-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"hillshade-highlight-color": {
		type: "color",
		"default": "#FFFFFF",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"hillshade-accent-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
};
var paint_background = {
	"background-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		requires: [
			{
				"!": "background-pattern"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"background-pattern": {
		type: "resolvedImage",
		transition: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "cross-faded"
	},
	"background-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
};
var transition = {
	duration: {
		type: "number",
		"default": 300,
		minimum: 0,
		units: "milliseconds"
	},
	delay: {
		type: "number",
		"default": 0,
		minimum: 0,
		units: "milliseconds"
	}
};
var promoteId = {
	"*": {
		type: "string"
	}
};
var v8Spec = {
	$version: $version,
	$root: $root,
	sources: sources,
	source: source,
	source_vector: source_vector,
	source_raster: source_raster,
	source_raster_dem: source_raster_dem,
	source_geojson: source_geojson,
	source_video: source_video,
	source_image: source_image,
	layer: layer,
	layout: layout,
	layout_background: layout_background,
	layout_fill: layout_fill,
	layout_circle: layout_circle,
	layout_heatmap: layout_heatmap,
	"layout_fill-extrusion": {
	visibility: {
		type: "enum",
		values: {
			visible: {
			},
			none: {
			}
		},
		"default": "visible",
		"property-type": "constant"
	}
},
	layout_line: layout_line,
	layout_symbol: layout_symbol,
	layout_raster: layout_raster,
	layout_hillshade: layout_hillshade,
	filter: filter,
	filter_operator: filter_operator,
	geometry_type: geometry_type,
	"function": {
	expression: {
		type: "expression"
	},
	stops: {
		type: "array",
		value: "function_stop"
	},
	base: {
		type: "number",
		"default": 1,
		minimum: 0
	},
	property: {
		type: "string",
		"default": "$zoom"
	},
	type: {
		type: "enum",
		values: {
			identity: {
			},
			exponential: {
			},
			interval: {
			},
			categorical: {
			}
		},
		"default": "exponential"
	},
	colorSpace: {
		type: "enum",
		values: {
			rgb: {
			},
			lab: {
			},
			hcl: {
			}
		},
		"default": "rgb"
	},
	"default": {
		type: "*",
		required: false
	}
},
	function_stop: function_stop,
	expression: expression,
	light: light,
	terrain: terrain,
	paint: paint,
	paint_fill: paint_fill,
	"paint_fill-extrusion": {
	"fill-extrusion-opacity": {
		type: "number",
		"default": 1,
		minimum: 0,
		maximum: 1,
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-extrusion-color": {
		type: "color",
		"default": "#000000",
		transition: true,
		requires: [
			{
				"!": "fill-extrusion-pattern"
			}
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-extrusion-translate": {
		type: "array",
		value: "number",
		length: 2,
		"default": [
			0,
			0
		],
		transition: true,
		units: "pixels",
		expression: {
			interpolated: true,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-extrusion-translate-anchor": {
		type: "enum",
		values: {
			map: {
			},
			viewport: {
			}
		},
		"default": "map",
		requires: [
			"fill-extrusion-translate"
		],
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	},
	"fill-extrusion-pattern": {
		type: "resolvedImage",
		transition: true,
		expression: {
			interpolated: false,
			parameters: [
				"zoom",
				"feature"
			]
		},
		"property-type": "cross-faded-data-driven"
	},
	"fill-extrusion-height": {
		type: "number",
		"default": 0,
		minimum: 0,
		units: "meters",
		transition: true,
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-extrusion-base": {
		type: "number",
		"default": 0,
		minimum: 0,
		units: "meters",
		transition: true,
		requires: [
			"fill-extrusion-height"
		],
		expression: {
			interpolated: true,
			parameters: [
				"zoom",
				"feature",
				"feature-state"
			]
		},
		"property-type": "data-driven"
	},
	"fill-extrusion-vertical-gradient": {
		type: "boolean",
		"default": true,
		transition: false,
		expression: {
			interpolated: false,
			parameters: [
				"zoom"
			]
		},
		"property-type": "data-constant"
	}
},
	paint_line: paint_line,
	paint_circle: paint_circle,
	paint_heatmap: paint_heatmap,
	paint_symbol: paint_symbol,
	paint_raster: paint_raster,
	paint_hillshade: paint_hillshade,
	paint_background: paint_background,
	transition: transition,
	"property-type": {
	"data-driven": {
		type: "property-type"
	},
	"cross-faded": {
		type: "property-type"
	},
	"cross-faded-data-driven": {
		type: "property-type"
	},
	"color-ramp": {
		type: "property-type"
	},
	"data-constant": {
		type: "property-type"
	},
	constant: {
		type: "property-type"
	}
},
	promoteId: promoteId
};

function validateGlyphsUrl(options) {
    const value = options.value;
    const key = options.key;
    const errors = validateString(options);
    if (errors.length)
        return errors;
    if (value.indexOf('{fontstack}') === -1) {
        errors.push(new ValidationError(key, value, '"glyphs" url must include a "{fontstack}" token'));
    }
    if (value.indexOf('{range}') === -1) {
        errors.push(new ValidationError(key, value, '"glyphs" url must include a "{range}" token'));
    }
    return errors;
}

/**
 * Validate a MapLibre style against the style specification. This entrypoint,
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
function validateStyleMin(style, styleSpec = v8Spec) {
    let errors = [];
    errors = errors.concat(validate({
        key: '',
        value: style,
        valueSpec: styleSpec.$root,
        styleSpec,
        style,
        validateSpec: validate,
        objectElementValidators: {
            glyphs: validateGlyphsUrl,
            '*'() {
                return [];
            }
        }
    }));
    if (style['constants']) {
        errors = errors.concat(validateConstants({
            key: 'constants',
            value: style['constants'],
            style,
            styleSpec,
            validateSpec: validate,
        }));
    }
    return sortErrors(errors);
}
validateStyleMin.source = wrapCleanErrors(injectValidateSpec(validateSource));
validateStyleMin.sprite = wrapCleanErrors(injectValidateSpec(validateSprite));
validateStyleMin.glyphs = wrapCleanErrors(injectValidateSpec(validateGlyphsUrl));
validateStyleMin.light = wrapCleanErrors(injectValidateSpec(validateLight));
validateStyleMin.terrain = wrapCleanErrors(injectValidateSpec(validateTerrain));
validateStyleMin.layer = wrapCleanErrors(injectValidateSpec(validateLayer));
validateStyleMin.filter = wrapCleanErrors(injectValidateSpec(validateFilter));
validateStyleMin.paintProperty = wrapCleanErrors(injectValidateSpec(validatePaintProperty));
validateStyleMin.layoutProperty = wrapCleanErrors(injectValidateSpec(validateLayoutProperty));
function injectValidateSpec(validator) {
    return function (options) {
        return validator({
            ...options,
            validateSpec: validate,
        });
    };
}
function sortErrors(errors) {
    return [].concat(errors).sort((a, b) => {
        return a.line - b.line;
    });
}
function wrapCleanErrors(inner) {
    return function (...args) {
        return sortErrors(inner.apply(this, args));
    };
}

// Note: Do not inherit from Error. It breaks when transpiling to ES5.
class ParsingError {
    constructor(error) {
        this.error = error;
        this.message = error.message;
        const match = error.message.match(/line (\d+)/);
        this.line = match ? parseInt(match[1], 10) : 0;
    }
}

const v8 = v8Spec;

function readStyle(style) {
    if (style instanceof String || typeof style === 'string' || style instanceof Buffer) {
        try {
            return jsonlint.parse(style.toString());
        }
        catch (e) {
            throw new ParsingError(e);
        }
    }
    return style;
}

/**
 * Validate a Mapbox GL style against the style specification.
 *
 * @private
 * @alias validate
 * @param {StyleSpecification|string|Buffer} style The style to be validated. If a `String`
 *     or `Buffer` is provided, the returned errors will contain line numbers.
 * @param {Object} [styleSpec] The style specification to validate against.
 *     If omitted, the spec version is inferred from the stylesheet.
 * @returns {Array<ValidationError|ParsingError>}
 * @example
 *   var validate = require('maplibre-gl-style-spec').validate;
 *   var style = fs.readFileSync('./style.json', 'utf8');
 *   var errors = validate(style);
 */
function validateStyle(style, styleSpec = v8) {
    let s = style;
    try {
        s = readStyle(s);
    }
    catch (e) {
        return [e];
    }
    return validateStyleMin(s, styleSpec);
}

const argv = minimist(process.argv.slice(2), {
    boolean: 'json',
});

if (argv.help || argv.h || (!argv._.length && process.stdin.isTTY)) {
    help();
} else {
    let status = 0;

    if (!argv._.length) {
        argv._.push('/dev/stdin');
    }

    argv._.forEach((file) => {
        const errors = validateStyle(rw.readFileSync(file, 'utf8'));
        if (errors.length) {
            if (argv.json) {
                process.stdout.write(JSON.stringify(errors, null, 2));
            } else {
                errors.forEach((e) => {
                    console.log('%s:%d: %s', file, e.line, e.message);
                });
            }
            status = 1;
        }
    });

    process.exit(status);
}

function help() {
    console.log('usage:');
    console.log('  gl-style-validate file.json');
    console.log('  gl-style-validate < file.json');
    console.log('');
    console.log('options:');
    console.log('--json  output errors as json');
}
//# sourceMappingURL=gl-style-validate.mjs.map

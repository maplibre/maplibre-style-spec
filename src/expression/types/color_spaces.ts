/**
 * @param r Red component 0..1
 * @param g Green component 0..1
 * @param b Blue component 0..1
 * @param alpha Alpha component 0..1
 */
export type RGBColor = [r: number, g: number, b: number, alpha: number];

/**
 * @param h Hue as degrees 0..360
 * @param s Saturation as percentage 0..100
 * @param l Lightness as percentage 0..100
 * @param alpha Alpha component 0..1
 */
export type HSLColor = [h: number, s: number, l: number, alpha: number];

/**
 * @param h Hue as degrees 0..360
 * @param c Chroma 0..~230
 * @param l Lightness as percentage 0..100
 * @param alpha Alpha component 0..1
 */
export type HCLColor = [h: number, c: number, l: number, alpha: number];

/**
 * @param l Lightness as percentage 0..100
 * @param a A axis value -125..125
 * @param b B axis value -125..125
 * @param alpha Alpha component 0..1
 */
export type LABColor = [l: number, a: number, b: number, alpha: number];

/**
 * @param l Lightness 0..1
 * @param c Chroma 0..~0.4
 * @param h Hue as degrees 0..360, `NaN` when missing
 * @param alpha Alpha component 0..1
 */
export type OKLCHColor = [l: number, c: number, h: number, alpha: number];

// See https://observablehq.com/@mbostock/lab-and-rgb
const Xn = 0.96422,
    Yn = 1,
    Zn = 0.82521,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1,
    deg2rad = Math.PI / 180,
    rad2deg = 180 / Math.PI;

function constrainAngle(angle: number): number {
    angle = angle % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

export function rgbToLab([r, g, b, alpha]: RGBColor): LABColor {
    r = rgb2xyz(r);
    g = rgb2xyz(g);
    b = rgb2xyz(b);
    let x, z;
    const y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn);
    if (r === g && g === b) {
        x = z = y;
    } else {
        x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
        z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }

    const l = 116 * y - 16;
    return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z), alpha];
}

function rgb2xyz(x: number): number {
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function xyz2lab(t: number): number {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

export function labToRgb([l, a, b, alpha]: LABColor): RGBColor {
    let y = (l + 16) / 116,
        x = isNaN(a) ? y : y + a / 500,
        z = isNaN(b) ? y : y - b / 200;

    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);

    return [
        xyz2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z), // D50 -> sRGB
        xyz2rgb(-0.9787684 * x + 1.9161415 * y + 0.033454 * z),
        xyz2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
        alpha
    ];
}

function xyz2rgb(x: number): number {
    x = x <= 0.00304 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return x < 0 ? 0 : x > 1 ? 1 : x; // clip to 0..1 range
}

function lab2xyz(t: number): number {
    return t > t1 ? t * t * t : t2 * (t - t0);
}

export function rgbToHcl(rgbColor: RGBColor): HCLColor {
    const [l, a, b, alpha] = rgbToLab(rgbColor);
    const c = Math.sqrt(a * a + b * b);
    const h = Math.round(c * 10000) ? constrainAngle(Math.atan2(b, a) * rad2deg) : NaN;
    return [h, c, l, alpha];
}

export function hclToRgb([h, c, l, alpha]: HCLColor): RGBColor {
    h = isNaN(h) ? 0 : h * deg2rad;
    return labToRgb([l, Math.cos(h) * c, Math.sin(h) * c, alpha]);
}

// https://drafts.csswg.org/css-color-4/#hsl-to-rgb
export function hslToRgb([h, s, l, alpha]: HSLColor): RGBColor {
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

type Vector3 = [number, number, number];
type Matrix3 = [Vector3, Vector3, Vector3];

// The matrices of https://drafts.csswg.org/css-color-4/#color-conversion-code
const linearSrgbToXyz: Matrix3 = [
    [506752 / 1228815, 87881 / 245763, 12673 / 70218],
    [87098 / 409605, 175762 / 245763, 12673 / 175545],
    [7918 / 409605, 87881 / 737289, 1001167 / 1053270]
];
const xyzToLinearSrgb: Matrix3 = [
    [12831 / 3959, -329 / 214, -1974 / 3959],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [705 / 12673, -2585 / 12673, 705 / 667]
];
const xyzToLms: Matrix3 = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
];
const lmsToOklab: Matrix3 = [
    [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
];
const oklabToLms: Matrix3 = [
    [1, 0.3963377773761749, 0.2158037573099136],
    [1, -0.1055613458156586, -0.0638541728258133],
    [1, -0.0894841775298119, -1.2914855480194092]
];
const lmsToXyz: Matrix3 = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
];

function multiply(m: Matrix3, [x, y, z]: Vector3): Vector3 {
    return [
        m[0][0] * x + m[0][1] * y + m[0][2] * z,
        m[1][0] * x + m[1][1] * y + m[1][2] * z,
        m[2][0] * x + m[2][1] * y + m[2][2] * z
    ];
}

function linearToSrgb(x: number): number {
    const abs = Math.abs(x);
    return abs > 0.0031308 ? Math.sign(x) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055) : 12.92 * x;
}

function srgbToOklab([r, g, b]: Vector3): Vector3 {
    const [l, m, s] = multiply(
        xyzToLms,
        multiply(linearSrgbToXyz, [rgb2xyz(r), rgb2xyz(g), rgb2xyz(b)])
    );
    return multiply(lmsToOklab, [Math.cbrt(l), Math.cbrt(m), Math.cbrt(s)]);
}

function oklabToSrgb(lab: Vector3): Vector3 {
    const [l, m, s] = multiply(oklabToLms, lab);
    const [r, g, b] = multiply(
        xyzToLinearSrgb,
        multiply(lmsToXyz, [l * l * l, m * m * m, s * s * s])
    );
    return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)];
}

// A hue is powerless, and missing, at a chroma of at most 0.000004: https://drafts.csswg.org/css-color-4/#powerless
export function rgbToOklch([r, g, b, alpha]: RGBColor): OKLCHColor {
    const [l, okA, okB] = srgbToOklab([r, g, b]);
    const c = Math.sqrt(okA * okA + okB * okB);
    if (c <= 0.000004) {
        return [l, 0, NaN, alpha];
    }
    return [l, c, constrainAngle(Math.atan2(okB, okA) * rad2deg), alpha];
}

// Keeps the conversion finite: past this chroma, the clipped color stops changing
const maxChroma = 1e6;

// Clips a color outside sRGB channel by channel, as browsers draw one
export function oklchToRgb([l, c, h, alpha]: OKLCHColor): RGBColor {
    const hue = isNaN(h) ? 0 : h * deg2rad;
    const chroma = Math.min(c, maxChroma);
    const [r, g, b] = oklabToSrgb([l, chroma * Math.cos(hue), chroma * Math.sin(hue)]).map((x) =>
        Math.min(Math.max(x, 0), 1)
    );
    return [r, g, b, alpha];
}

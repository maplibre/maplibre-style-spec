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

// Constants
const Xn = 0.950470, // D65 standard referent
    Yn = 1,
    Zn = 1.088830,
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

// sRGB -> LAB
function rgbToLab([r, g, b, alpha]: RGBColor): LABColor {
    r = rgb2xyz(r);
    g = rgb2xyz(g);
    b = rgb2xyz(b);
    const x = xyz2lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / Xn);
    const y = xyz2lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / Yn);
    const z = xyz2lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / Zn);

    const l = 116 * y - 16;
    return [(l < 0) ? 0 : l, 500 * (x - y), 200 * (y - z), alpha];
}

function rgb2xyz(x: number): number {
    return (x <= 0.04045) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function xyz2lab(t: number): number {
    return (t > t3) ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

// LAB -> sRGB
function labToRgb([l, a, b, alpha]: LABColor): RGBColor {
    let y = (l + 16) / 116,
        x = isNaN(a) ? y : y + a / 500,
        z = isNaN(b) ? y : y - b / 200;

    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);

    return [
        xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
        xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
        xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
        alpha,
    ];
}

function xyz2rgb(x: number): number {
    x = (x <= 0.00304) ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return (x < 0) ? 0 : (x > 1) ? 1 : x; // clip to 0..1 range
}

function lab2xyz(t: number): number {
    return (t > t1) ? t * t * t : t2 * (t - t0);
}

// sRGB -> HCL
function rgbToHcl(rgbColor: RGBColor): HCLColor {
    const [l, a, b, alpha] = rgbToLab(rgbColor);
    const c = Math.sqrt(a * a + b * b);
    const h = Math.round(c * 10000) ? constrainAngle(Math.atan2(b, a) * rad2deg) : NaN;
    return [h, c, l, alpha];
}

// HCL -> sRGB
function hclToRgb([h, c, l, alpha]: HCLColor): RGBColor {
    h = isNaN(h) ? 0 : h * deg2rad;
    return labToRgb([l, Math.cos(h) * c, Math.sin(h) * c, alpha]);
}

// HSL -> sRGB https://drafts.csswg.org/css-color-4/#hsl-to-rgb
function hslToRgb([h, s, l, alpha]: HSLColor): RGBColor {
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

export const lab = {
    fromRgb: rgbToLab,
    toRgb: labToRgb,
};

export const hcl = {
    fromRgb: rgbToHcl,
    toRgb: hclToRgb,
};

export const hsl = {
    toRgb: hslToRgb,
};

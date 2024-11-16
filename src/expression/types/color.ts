import {HCLColor, hclToRgb, LABColor, labToRgb, RGBColor, rgbToHcl, rgbToLab} from './color_spaces';
import {parseCssColor} from './parse_css_color';
import {interpolateArray, interpolateNumber} from '../../util/interpolate-primitives';

export type InterpolationColorSpace = 'rgb' | 'hcl' | 'lab';

/**
 * Checks whether the specified color space is one of the supported interpolation color spaces.
 *
 * @param colorSpace Color space key to verify.
 * @returns `true` if the specified color space is one of the supported
 * interpolation color spaces, `false` otherwise
 */
export function isSupportedInterpolationColorSpace(colorSpace: string): colorSpace is InterpolationColorSpace {
    return colorSpace === 'rgb' || colorSpace === 'hcl' || colorSpace === 'lab';
}

/**
 * Color representation used by WebGL.
 * Defined in sRGB color space and pre-blended with alpha.
 * @private
 */
export class Color {

    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    /**
     * @param r Red component premultiplied by `alpha` 0..1
     * @param g Green component premultiplied by `alpha` 0..1
     * @param b Blue component premultiplied by `alpha` 0..1
     * @param [alpha=1] Alpha component 0..1
     * @param [premultiplied=true] Whether the `r`, `g` and `b` values have already
     * been multiplied by alpha. If `true` nothing happens if `false` then they will
     * be multiplied automatically.
     */
    constructor(r: number, g: number, b: number, alpha = 1, premultiplied = true) {
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

    static black = new Color(0, 0, 0, 1);
    static white = new Color(1, 1, 1, 1);
    static transparent = new Color(0, 0, 0, 0);
    static red = new Color(1, 0, 0, 1);

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
    static parse(input: Color | string | undefined | null): Color | undefined {
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
    get rgb(): RGBColor {
        const {r, g, b, a} = this;
        const f = a || Infinity; // reverse alpha blending factor
        return this.overwriteGetter('rgb', [r / f, g / f, b / f, a]);
    }

    /**
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, in HCL color space.
     */
    get hcl(): HCLColor {
        return this.overwriteGetter('hcl', rgbToHcl(this.rgb));
    }

    /**
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, in LAB color space.
     */
    get lab(): LABColor {
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
    private overwriteGetter<T>(getterKey: string, lazyValue: T): T {
        Object.defineProperty(this, getterKey, {value: lazyValue});
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
    toString(): string {
        const [r, g, b, a] = this.rgb;
        return `rgba(${[r, g, b].map(n => Math.round(n * 255)).join(',')},${a})`;
    }

    static interpolate(from: Color, to: Color, t: number, spaceKey: InterpolationColorSpace = 'rgb'): Color {
        switch (spaceKey) {
            case 'rgb': {
                const [r, g, b, alpha] = interpolateArray(from.rgb, to.rgb, t);
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
                    } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                        dh += 360;
                    }
                    hue = hue0 + t * dh;
                } else if (!isNaN(hue0)) {
                    hue = hue0;
                    if (light1 === 1 || light1 === 0) chroma = chroma0;
                } else if (!isNaN(hue1)) {
                    hue = hue1;
                    if (light0 === 1 || light0 === 0) chroma = chroma1;
                } else {
                    hue = NaN;
                }
    
                const [r, g, b, alpha] = hclToRgb([
                    hue,
                    chroma ?? interpolateNumber(chroma0, chroma1, t),
                    interpolateNumber(light0, light1, t),
                    interpolateNumber(alphaF, alphaT, t),
                ]);
                return new Color(r, g, b, alpha, false);
            }
            case 'lab': {
                const [r, g, b, alpha] = labToRgb(interpolateArray(from.lab, to.lab, t));
                return new Color(r, g, b, alpha, false);
            }
        }
    }

}

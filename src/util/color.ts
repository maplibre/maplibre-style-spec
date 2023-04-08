import colorString from 'color-string';
import {hcl, hsl, lab, HCLColor, LABColor, RGBColor} from './color_spaces';

/**
 * Color representation used by WebGL.
 * Defined in sRGB color space and pre-blended with alpha.
 * @private
 */
class Color {

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

    static black: Color;
    static white: Color;
    static transparent: Color;
    static red: Color;

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
    static parse(input: string | undefined | null): Color | undefined {
        if (typeof input !== 'string') {
            return;
        }

        const rgba = parseCssColor(input.toLowerCase());
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
        return this.overwriteGetter('hcl', hcl.fromRgb(this.rgb));
    }

    /**
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, in LAB color space.
     */
    get lab(): LABColor {
        return this.overwriteGetter('lab', lab.fromRgb(this.rgb));
    }

    /**
     * Lazy getter pattern. When getter is called for the first time lazy value
     * is calculated and then overwrites getter function in given object instance.
     *
     * @param getterKey Getter key
     * @param lazyValue Lazy value
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

}

function parseCssColor(colorToParse: string): RGBColor | undefined {
    const parsingResult = colorString.get(colorToParse);
    switch (parsingResult?.model) {
        case 'rgb': {
            const [r, g, b, alpha] = parsingResult.value;
            return [r / 255, g / 255, b / 255, alpha];
        }
        case 'hsl': {
            return hsl.toRgb(parsingResult.value);
        }
    }
}

Color.black = new Color(0, 0, 0, 1);
Color.white = new Color(1, 1, 1, 1);
Color.transparent = new Color(0, 0, 0, 0);
Color.red = new Color(1, 0, 0, 1);

export default Color;

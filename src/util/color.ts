import {ColorSpace, HSL, Lab, LCH, parse, range, sRGB, to, toGamut} from 'colorjs.io/fn';
import type {ColorObject} from 'colorjs.io/types/src/color.js';

ColorSpace.register(sRGB); // for parsing: keyword + hex + rgb(a)
ColorSpace.register(HSL); // for parsing: hsl(a)
ColorSpace.register(LCH); // for interpolation in LCH/HCL space
ColorSpace.register(Lab); // for interpolation in LAB space

const interpolationColorSpace = {
    rgb: sRGB,
    hcl: LCH,
    lab: Lab,
} as const;

export type InterpolationColorSpace = keyof typeof interpolationColorSpace;
type ColorInterpolationFn = (t: number) => Color;

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
     * Local for every Color cache of interpolation functions
     * to other colors in given interpolation color space.
     * @private
     */
    private interpolationCache: Partial<Record<InterpolationColorSpace, WeakMap<Color, ColorInterpolationFn>>>;

    /**
     * @param r between 0 and 1. The red channel premultiplied by `alpha`.
     * @param g between 0 and 1. The green channel premultiplied by `alpha`.
     * @param b between 0 and 1. The blue channel premultiplied by `alpha`.
     * @param [alpha=1] between 0 and 1. The alpha channel.
     */
    constructor(r: number, g: number, b: number, alpha: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = alpha;
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
    static parse(input: String | string | undefined | null): Color | undefined {
        if (Object.prototype.toString.call(input) !== '[object String]') {
            return undefined;
        }

        try {
            const parsedColor = to(parse(input.toLowerCase()), sRGB, {inGamut: true});
            const {coords: [r, g, b], alpha} = parsedColor;
            const color = new Color(r * alpha, g * alpha, b * alpha, +alpha); // +alpha to cast Number to number
            if (!+alpha) {
                // alpha = 0 erases completely rgb channels. This behavior is not desirable
                // if this particular color is later used in color interpolation.
                // Because of that, a reference to original color is saved.
                color.overwriteGetter('sRGB', parsedColor);
            }
            return color;
        } catch {
            return undefined;
        }
    }

    /**
     * Checks whether the specified color space is one of the supported interpolation color spaces.
     *
     * @param colorSpace Color space key to verify.
     * @returns `true` if the specified color space is one of the supported
     * interpolation color spaces, `false` otherwise
     */
    static isSupportedColorSpace(colorSpace: string): colorSpace is InterpolationColorSpace {
        return colorSpace in interpolationColorSpace;
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
     * Used in color interpolation.
     *
     * @returns Gien color, with reversed alpha blending, as colorjs.io base color object.
     * @private
     */
    private get sRGB(): ColorObject {
        const {r, g, b, a} = this;
        return this.overwriteGetter('sRGB', {space: sRGB, coords: [r / a, g / a, b / a], alpha: a});
    }

    /**
     * Gets an interpolation function from this color to the target color in the specified
     * interpolation color space. Uses the cached value when it is available.
     *
     * @param to Interpolation target color.
     * @param colorSpaceKey Interpolation color space.
     * @returns An interpolation function that takes a number between 0 and 1 and returns a color.
     */
    getInterpolationFn(to: Color, colorSpaceKey: InterpolationColorSpace): ColorInterpolationFn {
        if (!this.interpolationCache?.[ colorSpaceKey ]) {
            this.interpolationCache = {...this.interpolationCache, [ colorSpaceKey ]: new WeakMap()};
        }
        const cacheForGivenColorSpace = this.interpolationCache[ colorSpaceKey ];
        let interpolationFn = cacheForGivenColorSpace.get(to);
        if (!interpolationFn) {
            const interpolationSpace = interpolationColorSpace[ colorSpaceKey ];
            const rangeFn = range(this.sRGB, to.sRGB, {space: interpolationSpace, outputSpace: sRGB});
            interpolationFn = (t: number): Color => {
                const {coords: [r, g, b], alpha} = toGamut(rangeFn(t) as unknown as ColorObject);
                return new Color(r * alpha, g * alpha, b * alpha, +alpha);
            };
            cacheForGivenColorSpace.set(to, interpolationFn);
        }
        return interpolationFn;
    }

}

Color.black = new Color(0, 0, 0, 1);
Color.white = new Color(1, 1, 1, 1);
Color.transparent = new Color(0, 0, 0, 0);
Color.red = new Color(1, 0, 0, 1);

export default Color;

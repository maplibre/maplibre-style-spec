import {hclToRgb, labToRgb} from './color_spaces';
import Color from './color';
import Padding from './padding';

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
 * @param interpolationType Interpolation type
 * @returns interpolation fn
 * @deprecated use `interpolate[type]` instead
 */
export const interpolateFactory = (interpolationType: 'number'|'color'|'array'|'padding') => {
    switch (interpolationType) {
        case 'number': return number;
        case 'color': return color;
        case 'array': return array;
        case 'padding': return padding;
    }
};

function number(from: number, to: number, t: number): number {
    return from + t * (to - from);
}

function color(from: Color, to: Color, t: number, spaceKey: InterpolationColorSpace = 'rgb'): Color {
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
                chroma ?? number(chroma0, chroma1, t),
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

function array<T extends number[]>(from: T, to: T, t: number): T {
    return from.map((d, i) => {
        return number(d, to[i], t);
    }) as T;
}

function padding(from: Padding, to: Padding, t: number): Padding {
    return new Padding(array(from.values, to.values, t));
}

const interpolate = {
    number,
    color,
    array,
    padding,
};

export default interpolate;

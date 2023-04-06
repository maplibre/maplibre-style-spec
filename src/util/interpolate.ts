import {hcl, lab, RGBColor} from './color_spaces';
import Color from './color';
import Padding from './padding';

export type InterpolationColorSpace = keyof typeof colorInterpolation;

/**
 * Checks whether the specified color space is one of the supported interpolation color spaces.
 *
 * @param colorSpace Color space key to verify.
 * @returns `true` if the specified color space is one of the supported
 * interpolation color spaces, `false` otherwise
 */
export function isSupportedInterpolationColorSpace(colorSpace: string): colorSpace is InterpolationColorSpace {
    return colorSpace in colorInterpolation;
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

const colorInterpolation = {
    rgb: (from: Color, to: Color, t: number): RGBColor => {
        const [rF, gF, bF, alphaF] = from.rgb;
        const [rT, gT, bT, alphaT] = to.rgb;
        return [
            number(rF, rT, t),
            number(gF, gT, t),
            number(bF, bT, t),
            number(alphaF, alphaT, t),
        ];
    },
    hcl: (from: Color, to: Color, t: number): RGBColor => {
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

        return hcl.toRgb([
            hue,
            chroma ?? number(chroma0, chroma1, t),
            number(light0, light1, t),
            number(alphaF, alphaT, t),
        ]);
    },
    lab: (from: Color, to: Color, t: number): RGBColor => {
        const [lF, aF, bF, alphaF] = from.lab;
        const [lT, aT, bT, alphaT] = to.lab;
        return lab.toRgb([
            number(lF, lT, t),
            number(aF, aT, t),
            number(bF, bT, t),
            number(alphaF, alphaT, t),
        ]);
    },
};

function color(from: Color, to: Color, t: number, spaceKey: InterpolationColorSpace = 'rgb'): Color {
    const [r, g, b, alpha] = colorInterpolation[ spaceKey ](from, to, t);
    return new Color(r * alpha, g * alpha, b * alpha, alpha);
}

function array(from: number[], to: number[], t: number): number[] {
    return from.map((d, i) => {
        return number(d, to[i], t);
    });
}

function padding(from: Padding, to: Padding, t: number): Padding {
    const fromVal = from.values;
    const toVal = to.values;
    return new Padding([
        number(fromVal[0], toVal[0], t),
        number(fromVal[1], toVal[1], t),
        number(fromVal[2], toVal[2], t),
        number(fromVal[3], toVal[3], t),
    ]);
}

const interpolate = {
    number,
    color,
    array,
    padding,
};

export default interpolate;

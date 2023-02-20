import Color from './color';
import Padding from './padding';

export function range(a: number, b: number, t: number) {
    return (a * (1 - t)) + (b * t);
}

export function color(from: Color, to: Color, t: number) {
    return new Color(
        range(from.r, to.r, t),
        range(from.g, to.g, t),
        range(from.b, to.b, t),
        range(from.a, to.a, t)
    );
}

export function array(from: Array<number>, to: Array<number>, t: number): Array<number> {
    return from.map((d, i) => {
        return range(d, to[i], t);
    });
}

export function padding(from: Padding, to: Padding, t: number): Padding {
    const fromVal = from.values;
    const toVal = to.values;
    return new Padding([
        range(fromVal[0], toVal[0], t),
        range(fromVal[1], toVal[1], t),
        range(fromVal[2], toVal[2], t),
        range(fromVal[3], toVal[3], t)
    ]);
}

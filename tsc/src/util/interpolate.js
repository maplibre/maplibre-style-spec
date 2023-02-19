import Color from './color';
import Padding from './padding';
export function number(a, b, t) {
    return (a * (1 - t)) + (b * t);
}
export function color(from, to, t) {
    return new Color(number(from.r, to.r, t), number(from.g, to.g, t), number(from.b, to.b, t), number(from.a, to.a, t));
}
export function array(from, to, t) {
    return from.map((d, i) => {
        return number(d, to[i], t);
    });
}
export function padding(from, to, t) {
    const fromVal = from.values;
    const toVal = to.values;
    return new Padding([
        number(fromVal[0], toVal[0], t),
        number(fromVal[1], toVal[1], t),
        number(fromVal[2], toVal[2], t),
        number(fromVal[3], toVal[3], t)
    ]);
}
//# sourceMappingURL=interpolate.js.map
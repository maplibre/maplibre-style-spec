import Color from './color';
type LABColor = {
    l: number;
    a: number;
    b: number;
    alpha: number;
};
type HCLColor = {
    h: number;
    c: number;
    l: number;
    alpha: number;
};
declare function rgbToLab(rgbColor: Color): LABColor;
declare function labToRgb(labColor: LABColor): Color;
declare function interpolateLab(from: LABColor, to: LABColor, t: number): {
    l: number;
    a: number;
    b: number;
    alpha: number;
};
declare function rgbToHcl(rgbColor: Color): HCLColor;
declare function hclToRgb(hclColor: HCLColor): Color;
declare function interpolateHcl(from: HCLColor, to: HCLColor, t: number): {
    h: number;
    c: number;
    l: number;
    alpha: number;
};
export declare const lab: {
    forward: typeof rgbToLab;
    reverse: typeof labToRgb;
    interpolate: typeof interpolateLab;
};
export declare const hcl: {
    forward: typeof rgbToHcl;
    reverse: typeof hclToRgb;
    interpolate: typeof interpolateHcl;
};
export {};

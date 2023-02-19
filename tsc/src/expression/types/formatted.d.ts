import type Color from '../../util/color';
import type ResolvedImage from '../types/resolved_image';
export declare class FormattedSection {
    text: string;
    image: ResolvedImage | null;
    scale: number | null;
    fontStack: string | null;
    textColor: Color | null;
    constructor(text: string, image: ResolvedImage | null, scale: number | null, fontStack: string | null, textColor: Color | null);
}
export default class Formatted {
    sections: Array<FormattedSection>;
    constructor(sections: Array<FormattedSection>);
    static fromString(unformatted: string): Formatted;
    isEmpty(): boolean;
    static factory(text: Formatted | string): Formatted;
    toString(): string;
}

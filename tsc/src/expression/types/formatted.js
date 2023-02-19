export class FormattedSection {
    constructor(text, image, scale, fontStack, textColor) {
        this.text = text;
        this.image = image;
        this.scale = scale;
        this.fontStack = fontStack;
        this.textColor = textColor;
    }
}
export default class Formatted {
    constructor(sections) {
        this.sections = sections;
    }
    static fromString(unformatted) {
        return new Formatted([new FormattedSection(unformatted, null, null, null, null)]);
    }
    isEmpty() {
        if (this.sections.length === 0)
            return true;
        return !this.sections.some(section => section.text.length !== 0 ||
            (section.image && section.image.name.length !== 0));
    }
    static factory(text) {
        if (text instanceof Formatted) {
            return text;
        }
        else {
            return Formatted.fromString(text);
        }
    }
    toString() {
        if (this.sections.length === 0)
            return '';
        return this.sections.map(section => section.text).join('');
    }
}
//# sourceMappingURL=formatted.js.map
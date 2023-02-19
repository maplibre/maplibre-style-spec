export default class ResolvedImage {
    constructor(options) {
        this.name = options.name;
        this.available = options.available;
    }
    toString() {
        return this.name;
    }
    static fromString(name) {
        if (!name)
            return null; // treat empty values as no image
        return new ResolvedImage({ name, available: false });
    }
}
//# sourceMappingURL=resolved_image.js.map
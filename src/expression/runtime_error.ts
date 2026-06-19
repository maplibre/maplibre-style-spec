export class RuntimeError extends Error {
    /** Index path of the throwing sub-expression (e.g. `[3][0]`), or '' at the root. */
    readonly path: string;

    constructor(message: string, path: string) {
        super(message);
        this.name = 'RuntimeError';
        this.path = path;
    }

    toJSON() {
        return this.message;
    }
}

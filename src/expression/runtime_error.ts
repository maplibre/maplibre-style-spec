export class RuntimeError extends Error {
    /**
     * Index path of the throwing sub-expression (e.g. `[3][0]`); the empty string
     * means the throw is at the root of the expression. Combined with the root key
     * at the catch site to locate it in the style JSON.
     */
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

/**
 * Tracks `let` bindings during expression parsing.
 * @private
 */
class Scope {
    constructor(parent, bindings = []) {
        this.parent = parent;
        this.bindings = {};
        for (const [name, expression] of bindings) {
            this.bindings[name] = expression;
        }
    }
    concat(bindings) {
        return new Scope(this, bindings);
    }
    get(name) {
        if (this.bindings[name]) {
            return this.bindings[name];
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`${name} not found in scope.`);
    }
    has(name) {
        if (this.bindings[name])
            return true;
        return this.parent ? this.parent.has(name) : false;
    }
}
export default Scope;
//# sourceMappingURL=scope.js.map
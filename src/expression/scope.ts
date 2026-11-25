import type {Expression} from './expression';

/**
 * Tracks `let` bindings during expression parsing.
 * @private
 */
export class Scope {
    parent: Scope;
    // A Map, so that names like "__proto__" or "toString" can't resolve to members of Object.prototype
    bindings: Map<string, Expression>;
    constructor(parent?: Scope, bindings: Array<[string, Expression]> = []) {
        this.parent = parent;
        this.bindings = new Map(bindings);
    }

    concat(bindings: Array<[string, Expression]>) {
        return new Scope(this, bindings);
    }

    get(name: string): Expression {
        if (this.bindings.has(name)) {
            return this.bindings.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`${name} not found in scope.`);
    }

    has(name: string): boolean {
        if (this.bindings.has(name)) return true;
        return this.parent ? this.parent.has(name) : false;
    }
}

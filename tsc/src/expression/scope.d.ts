import type { Expression } from './expression';
/**
 * Tracks `let` bindings during expression parsing.
 * @private
 */
declare class Scope {
    parent: Scope;
    bindings: {
        [_: string]: Expression;
    };
    constructor(parent?: Scope, bindings?: Array<[string, Expression]>);
    concat(bindings: Array<[string, Expression]>): Scope;
    get(name: string): Expression;
    has(name: string): boolean;
}
export default Scope;

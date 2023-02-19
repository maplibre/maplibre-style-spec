import Scope from './scope';
import ExpressionParsingError from './parsing_error';
import type { Expression, ExpressionRegistry } from './expression';
import type { Type } from './types';
/**
 * State associated parsing at a given point in an expression tree.
 * @private
 */
declare class ParsingContext {
    registry: ExpressionRegistry;
    path: Array<number>;
    key: string;
    scope: Scope;
    errors: Array<ExpressionParsingError>;
    expectedType: Type;
    /**
     * Internal delegate to inConstant function to avoid circular dependency to CompoundExpression
     */
    private _isConstant;
    constructor(registry: ExpressionRegistry, isConstantFunc: (expression: Expression) => boolean, path?: Array<number>, expectedType?: Type | null, scope?: Scope, errors?: Array<ExpressionParsingError>);
    /**
     * @param expr the JSON expression to parse
     * @param index the optional argument index if this expression is an argument of a parent expression that's being parsed
     * @param options
     * @param options.omitTypeAnnotations set true to omit inferred type annotations.  Caller beware: with this option set, the parsed expression's type will NOT satisfy `expectedType` if it would normally be wrapped in an inferred annotation.
     * @private
     */
    parse(expr: unknown, index?: number, expectedType?: Type | null, bindings?: Array<[string, Expression]>, options?: {
        typeAnnotation?: 'assert' | 'coerce' | 'omit';
    }): Expression;
    _parse(expr: unknown, options: {
        typeAnnotation?: 'assert' | 'coerce' | 'omit';
    }): Expression;
    /**
     * Returns a copy of this context suitable for parsing the subexpression at
     * index `index`, optionally appending to 'let' binding map.
     *
     * Note that `errors` property, intended for collecting errors while
     * parsing, is copied by reference rather than cloned.
     * @private
     */
    concat(index: number, expectedType?: Type | null, bindings?: Array<[string, Expression]>): ParsingContext;
    /**
     * Push a parsing (or type checking) error into the `this.errors`
     * @param error The message
     * @param keys Optionally specify the source of the error at a child
     * of the current expression at `this.key`.
     * @private
     */
    error(error: string, ...keys: Array<number>): void;
    /**
     * Returns null if `t` is a subtype of `expected`; otherwise returns an
     * error message and also pushes it to `this.errors`.
     */
    checkSubtype(expected: Type, t: Type): string;
}
export default ParsingContext;

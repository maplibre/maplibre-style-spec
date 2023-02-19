import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
declare class IndexOf implements Expression {
    type: Type;
    needle: Expression;
    haystack: Expression;
    fromIndex: Expression;
    constructor(needle: Expression, haystack: Expression, fromIndex?: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default IndexOf;

import type { Type } from '../types';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
declare class Let implements Expression {
    type: Type;
    bindings: Array<[string, Expression]>;
    result: Expression;
    constructor(bindings: Array<[string, Expression]>, result: Expression);
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    outputDefined(): boolean;
}
export default Let;

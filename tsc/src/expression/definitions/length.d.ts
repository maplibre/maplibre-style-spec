import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
declare class Length implements Expression {
    type: Type;
    input: Expression;
    constructor(input: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): number;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Length;

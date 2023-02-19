import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
import type { Value } from '../values';
declare class At implements Expression {
    type: Type;
    index: Expression;
    input: Expression;
    constructor(type: Type, index: Expression, input: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): Value;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default At;

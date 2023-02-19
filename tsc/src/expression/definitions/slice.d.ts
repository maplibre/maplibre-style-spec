import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
declare class Slice implements Expression {
    type: Type;
    input: Expression;
    beginIndex: Expression;
    endIndex: Expression;
    constructor(type: Type, input: Expression, beginIndex: Expression, endIndex?: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Slice;

import type { Stops } from '../stops';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
declare class Step implements Expression {
    type: Type;
    input: Expression;
    labels: Array<number>;
    outputs: Array<Expression>;
    constructor(type: Type, input: Expression, stops: Stops);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Step;

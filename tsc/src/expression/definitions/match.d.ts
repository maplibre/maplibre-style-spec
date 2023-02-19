import type { Type } from '../types';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
type Cases = {
    [k in number | string]: number;
};
declare class Match implements Expression {
    type: Type;
    inputType: Type;
    input: Expression;
    cases: Cases;
    outputs: Array<Expression>;
    otherwise: Expression;
    constructor(inputType: Type, outputType: Type, input: Expression, cases: Cases, outputs: Array<Expression>, otherwise: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Match;

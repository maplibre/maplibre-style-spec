import type { Type } from '../types';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
declare class Var implements Expression {
    type: Type;
    name: string;
    boundExpression: Expression;
    constructor(name: string, boundExpression: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(): void;
    outputDefined(): boolean;
}
export default Var;

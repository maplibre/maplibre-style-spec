import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
type Branches = Array<[Expression, Expression]>;
declare class Case implements Expression {
    type: Type;
    branches: Branches;
    otherwise: Expression;
    constructor(type: Type, branches: Branches, otherwise: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Case;

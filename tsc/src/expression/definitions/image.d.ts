import ResolvedImage from '../types/resolved_image';
import type { Expression } from '../expression';
import type EvaluationContext from '../evaluation_context';
import type ParsingContext from '../parsing_context';
import type { Type } from '../types';
export default class ImageExpression implements Expression {
    type: Type;
    input: Expression;
    constructor(input: Expression);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): ResolvedImage;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}

import type { Expression } from '../expression';
import type EvaluationContext from '../evaluation_context';
import type ParsingContext from '../parsing_context';
import type { Type } from '../types';
export default class NumberFormat implements Expression {
    type: Type;
    number: Expression;
    locale: Expression | null;
    currency: Expression | null;
    minFractionDigits: Expression | null;
    maxFractionDigits: Expression | null;
    constructor(number: Expression, locale: Expression | null, currency: Expression | null, minFractionDigits: Expression | null, maxFractionDigits: Expression | null);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): string;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}

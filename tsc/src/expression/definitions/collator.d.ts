import Collator from '../types/collator';
import type { Expression } from '../expression';
import type EvaluationContext from '../evaluation_context';
import type ParsingContext from '../parsing_context';
import type { Type } from '../types';
export default class CollatorExpression implements Expression {
    type: Type;
    caseSensitive: Expression;
    diacriticSensitive: Expression;
    locale: Expression | null;
    constructor(caseSensitive: Expression, diacriticSensitive: Expression, locale: Expression | null);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): Collator;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}

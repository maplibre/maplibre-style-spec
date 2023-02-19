import Formatted from '../types/formatted';
import type { Expression } from '../expression';
import type EvaluationContext from '../evaluation_context';
import type ParsingContext from '../parsing_context';
import type { Type } from '../types';
type FormattedSectionExpression = {
    content: Expression;
    scale: Expression | null;
    font: Expression | null;
    textColor: Expression | null;
};
export default class FormatExpression implements Expression {
    type: Type;
    sections: Array<FormattedSectionExpression>;
    constructor(sections: Array<FormattedSectionExpression>);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): Formatted;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export {};

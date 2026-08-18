import type {Type} from './types';
import type {ParsingContext} from './parsing_context';
import type {EvaluationContext} from './evaluation_context';

/**
 * Expression
 */
export interface Expression {
    readonly type: Type;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (a: Expression) => void): void;
    /**
     * Statically analyze the expression, attempting to enumerate possible outputs. Returns
     * false if the complete set of outputs is statically undecidable, otherwise true.
     */
    outputDefined(): boolean;
    /**
     * Set on expressions that may produce a different result on every evaluation, even
     * with constant arguments, and so must never be folded into a constant.
     */
    readonly neverConstant?: boolean;
    /**
     * Set on expressions that read from the feature being evaluated, and so are never
     * feature-constant regardless of their arguments.
     */
    readonly featureDependent?: boolean;
}

export type ExpressionParser = (
    args: ReadonlyArray<unknown>,
    context: ParsingContext
) => Expression;
export type ExpressionRegistration = {
    new (...args: any): Expression;
} & {
    readonly parse: ExpressionParser;
};
export type ExpressionRegistry = {[_: string]: ExpressionRegistration};

import type { Expression } from '../expression';
import type EvaluationContext from '../evaluation_context';
import type ParsingContext from '../parsing_context';
import type { Type } from '../types';
export declare const Equals: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};
export declare const NotEquals: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};
export declare const LessThan: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};
export declare const GreaterThan: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};
export declare const LessThanOrEqual: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};
export declare const GreaterThanOrEqual: {
    new (lhs: Expression, rhs: Expression, collator?: Expression | null): {
        type: Type;
        lhs: Expression;
        rhs: Expression;
        collator: Expression;
        hasUntypedArgument: boolean;
        evaluate(ctx: EvaluationContext): any;
        eachChild(fn: (_: Expression) => void): void;
        outputDefined(): boolean;
    };
    parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
};

import ParsingContext from './parsing_context';
import EvaluationContext from './evaluation_context';
import type { Expression, ExpressionRegistry } from './expression';
import type { Type } from './types';
import type { Value } from './values';
export type Varargs = {
    type: Type;
};
type Signature = Array<Type> | Varargs;
type Evaluate = (b: EvaluationContext, a: Array<Expression>) => Value;
type Definition = [Type, Signature, Evaluate] | {
    type: Type;
    overloads: Array<[Signature, Evaluate]>;
};
declare class CompoundExpression implements Expression {
    name: string;
    type: Type;
    _evaluate: Evaluate;
    args: Array<Expression>;
    static definitions: {
        [_: string]: Definition;
    };
    constructor(name: string, type: Type, evaluate: Evaluate, args: Array<Expression>);
    evaluate(ctx: EvaluationContext): Value;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    static register(registry: ExpressionRegistry, definitions: {
        [_: string]: Definition;
    }): void;
}
declare function isExpressionConstant(expression: Expression): any;
declare function isFeatureConstant(e: Expression): boolean;
declare function isStateConstant(e: Expression): boolean;
declare function isGlobalPropertyConstant(e: Expression, properties: Array<string>): boolean;
export { isFeatureConstant, isGlobalPropertyConstant, isStateConstant, isExpressionConstant };
export default CompoundExpression;

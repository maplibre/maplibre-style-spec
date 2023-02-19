import type { Stops } from '../stops';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
import type { Type } from '../types';
export type InterpolationType = {
    name: 'linear';
} | {
    name: 'exponential';
    base: number;
} | {
    name: 'cubic-bezier';
    controlPoints: [number, number, number, number];
};
declare class Interpolate implements Expression {
    type: Type;
    operator: 'interpolate' | 'interpolate-hcl' | 'interpolate-lab';
    interpolation: InterpolationType;
    input: Expression;
    labels: Array<number>;
    outputs: Array<Expression>;
    constructor(type: Type, operator: 'interpolate' | 'interpolate-hcl' | 'interpolate-lab', interpolation: InterpolationType, input: Expression, stops: Stops);
    static interpolationFactor(interpolation: InterpolationType, input: number, lower: number, upper: number): number;
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): any;
    eachChild(fn: (_: Expression) => void): void;
    outputDefined(): boolean;
}
export default Interpolate;

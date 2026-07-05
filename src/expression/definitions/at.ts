import {array, ValueType, NumberType} from '../types';

import {RuntimeError} from '../runtime_error';

import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import type {Type, ArrayType} from '../types';
import type {Value} from '../values';

export class At implements Expression {
    constructor(
        public type: Type,
        public index: Expression,
        public input: Expression,
        public readonly key: string
    ) {}

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 3)
            return context.error(
                `Expected 2 arguments, but found ${args.length - 1} instead.`
            ) as null;

        const index = context.parse(args[1], 1, NumberType);
        const input = context.parse(args[2], 2, array(context.expectedType || ValueType));

        if (!index || !input) return null;

        const t: ArrayType = input.type as any;
        return new At(t.itemType, index, input, context.key);
    }

    evaluate(ctx: EvaluationContext) {
        const index = this.index.evaluate(ctx) as any as number;
        const array = this.input.evaluate(ctx) as any as Array<Value>;

        if (index < 0) {
            throw new RuntimeError(`Array index out of bounds: ${index} < 0.`, this.key);
        }

        if (index >= array.length) {
            throw new RuntimeError(
                `Array index out of bounds: ${index} > ${array.length - 1}.`,
                this.key
            );
        }

        if (index !== Math.floor(index)) {
            throw new RuntimeError(
                `Array index must be an integer, but found ${index} instead.`,
                this.key
            );
        }

        return array[index];
    }

    eachChild(fn: (_: Expression) => void) {
        fn(this.index);
        fn(this.input);
    }

    outputDefined() {
        return false;
    }
}

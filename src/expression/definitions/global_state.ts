import {Type, isValidType, StringType, ValueType, isValidNativeType, typeToString} from '../types';
import type {Expression} from '../expression';
import { valueToString } from '../values';
import { RuntimeError } from '../runtime_error';
import { ParsingContext } from '../parsing_context';
import { EvaluationContext } from '../evaluation_context';

export class GlobalState implements Expression {
    type: Type;
    input: Expression;

    constructor(input: Expression) {
        this.type = ValueType;
        this.input = input;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(`Expected 1 argument, but found ${args.length - 1} instead.`) as null;

        const input = context.parse(args[1], 1);

        if (!isValidType(input.type, [StringType, ValueType])) {
            return context.error(`Global state property must be string, but found ${typeToString(input.type)} instead.`) as null;
        }

        if (!input) return null;

        return new GlobalState(input);
    }

    evaluate(ctx: EvaluationContext) {
        const globalState = ctx.globals?.globalState;

        if (!globalState || Object.keys(globalState).length === 0) return null;

        const key = this.input.evaluate(ctx);

        if (!isValidNativeType(key, ['string'])) {
            throw new RuntimeError(`Global state property must be string, but found ${valueToString(key)} instead,`);
        }

        return globalState[key];
    }

    eachChild(fn: (_: Expression) => void) {
        fn(this.input);
    }

    outputDefined() {
        return false;
    }
}

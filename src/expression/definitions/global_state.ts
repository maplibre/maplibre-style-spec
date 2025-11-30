import {Type, ValueType} from '../types';
import type {Expression} from '../expression';
import {ParsingContext} from '../parsing_context';
import {EvaluationContext} from '../evaluation_context';
import {getOwn} from '../../util/get_own';

export class GlobalState implements Expression {
    type: Type;
    key: string;

    constructor(key: string) {
        this.type = ValueType;
        this.key = key;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2) {
            return context.error(
                `Expected 1 argument, but found ${args.length - 1} instead.`
            ) as null;
        }

        const key = args[1];

        if (key === undefined || key === null) {
            return context.error('Global state property must be defined.') as null;
        }

        if (typeof key !== 'string') {
            return context.error(
                `Global state property must be string, but found ${typeof args[1]} instead.`
            ) as null;
        }

        return new GlobalState(key);
    }

    evaluate(ctx: EvaluationContext) {
        const globalState = ctx.globals?.globalState;

        if (!globalState || Object.keys(globalState).length === 0) return null;

        return getOwn(globalState, this.key);
    }

    eachChild() {}

    outputDefined() {
        return false;
    }
}

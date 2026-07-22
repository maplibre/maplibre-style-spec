import {ValueType, array} from '../types';

import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import type {Type} from '../types';
import {typeOf, Value, isValue} from '../values';
import {Literal} from './literal';

export class Semiliteral implements Expression {
    type: Type;
    arr: Array<Expression>;

    constructor(arr: Array<Expression>) {
        let elementType: Type | null = null;
        for (const expr of arr) {
            if (!elementType) {
                elementType = expr.type;
            } else if (elementType === expr.type) {
                continue;
            } else {
                elementType = ValueType;
                break;
            }
        }
        this.type = array(elementType ?? ValueType, arr.length);
        this.arr = arr;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(
                `'semiliteral' expression requires exactly one argument, but found ${args.length - 1} instead.`
            ) as null;

        if (!isValue(args[1]))
            return context.error(`invalid value of type "${typeof args[1]}"`) as null;

        const value = args[1] as Value;
        const type = typeOf(value);

        if (type.kind === 'array') {
            const arr = value as Array<unknown>;
            const parsed = arr.map((item) => context.parse(item, null, ValueType));
            return new Semiliteral(parsed);
        } else {
            return new Literal(type, value);
        }
    }

    evaluate(ctx: EvaluationContext): Array<Value> {
        return this.arr.map((arg) => arg.evaluate(ctx));
    }

    eachChild(fn: (_: Expression) => void) {
        this.arr.forEach(fn);
    }

    outputDefined() {
        return this.arr.every((arg) => arg.outputDefined());
    }
}

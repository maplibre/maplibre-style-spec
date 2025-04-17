import {
    ObjectType,
    ValueType,
    array,
} from '../types';

import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import type {Type} from '../types';
import {typeOf, Value, isValue} from '../values';
import {Literal} from './literal';

export abstract class Semiliteral implements Expression {
    type: Type;

    constructor(type: Type) {
        this.type = type;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(`'semiliteral' expression requires exactly one argument, but found ${args.length - 1} instead.`) as null;

        if (!isValue(args[1]))
            return context.error('invalid value') as null;

        const value = args[1] as Value;
        const type = typeOf(value);

        if (type.kind === 'array') {
            const arr = value as Array<unknown>;
            const parsed = arr.map(item => context.parse(item, null, ValueType));
            return new ArraySemiliteral(parsed);
        } else if (type.kind === 'object') {
            const obj = value as Record<string, unknown>;
            const parsed = Object.keys(obj).reduce((acc, key) => {
                acc[key] = context.parse(obj[key], null, ValueType);
                return acc;
            }, {} as Record<string, Expression>);
            return new ObjectSemiliteral(parsed);
        } else {
            return new Literal(type, value);
        }
    }

    abstract evaluate(ctx: EvaluationContext): Value;

    abstract eachChild(fn: (_: Expression) => void): void;

    abstract outputDefined(): boolean;
}

class ArraySemiliteral extends Semiliteral {
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
        super(array(elementType ?? ValueType, arr.length));
        this.arr = arr;
    }

    evaluate(ctx: EvaluationContext): Array<Value> {
        return this.arr.map(arg => arg.evaluate(ctx));
    }

    eachChild(fn: (_: Expression) => void) {
        this.arr.forEach(fn);
    }

    outputDefined() {
        return this.arr.every(arg => arg.outputDefined());
    }
}

class ObjectSemiliteral extends Semiliteral {
    obj: Record<string, Expression>;

    constructor(obj: Record<string, Expression>) {
        super(ObjectType);
        this.obj = obj;
    }

    evaluate(ctx: EvaluationContext): Record<string, Value> {
        return Object.keys(this.obj).reduce((acc, key) => {
            acc[key] = this.obj[key].evaluate(ctx);
            return acc;
        }, {} as Record<string, Value>);
    }

    eachChild(fn: (_: Expression) => void) {
        Object.values(this.obj).forEach(fn);
    }

    outputDefined() {
        return Object.values(this.obj).every(arg => arg.outputDefined());
    }
}

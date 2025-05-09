import {BooleanType, ColorType, NumberType, StringType, ValueType} from '../types';
import {valueToString, validateRGBA} from '../values';
import {RuntimeError} from '../runtime_error';
import {Formatted} from '../types/formatted';
import {ResolvedImage} from '../types/resolved_image';
import {Color} from '../types/color';
import {Padding} from '../types/padding';
import {NumberArray} from '../types/number_array';
import {ColorArray} from '../types/color_array';
import {VariableAnchorOffsetCollection} from '../types/variable_anchor_offset_collection';

import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import type {Type} from '../types';

const types = {
    'to-boolean': BooleanType,
    'to-color': ColorType,
    'to-number': NumberType,
    'to-string': StringType
};

/**
 * Special form for error-coalescing coercion expressions "to-number",
 * "to-color".  Since these coercions can fail at runtime, they accept multiple
 * arguments, only evaluating one at a time until one succeeds.
 *
 * @private
 */
export class Coercion implements Expression {
    type: Type;
    args: Array<Expression>;

    constructor(type: Type, args: Array<Expression>) {
        this.type = type;
        this.args = args;

    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length < 2)
            return context.error('Expected at least one argument.') as null;

        const name: string = (args[0] as any);
        if (!types[name]) throw new Error(`Can't parse ${name} as it is not part of the known types`);
        if ((name === 'to-boolean' || name === 'to-string') && args.length !== 2)
            return context.error('Expected one argument.') as null;

        const type = types[name];

        const parsed = [];
        for (let i = 1; i < args.length; i++) {
            const input = context.parse(args[i], i, ValueType);
            if (!input) return null;
            parsed.push(input);
        }

        return new Coercion(type, parsed);
    }

    evaluate(ctx: EvaluationContext) {
        switch (this.type.kind) {
            case 'boolean':
                return Boolean(this.args[0].evaluate(ctx));
            case 'color': {
                let input;
                let error;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);
                    error = null;
                    if (input instanceof Color) {
                        return input;
                    } else if (typeof input === 'string') {
                        const c = ctx.parseColor(input);
                        if (c) return c;
                    } else if (Array.isArray(input)) {
                        if (input.length < 3 || input.length > 4) {
                            error = `Invalid rgba value ${JSON.stringify(input)}: expected an array containing either three or four numeric values.`;
                        } else {
                            error = validateRGBA(input[0], input[1], input[2], input[3]);
                        }
                        if (!error) {
                            return new Color((input[0] as any) / 255, (input[1] as any) / 255, (input[2] as any) / 255, (input[3] as any));
                        }
                    }
                }
                throw new RuntimeError(error || `Could not parse color from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'padding': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);

                    const pad = Padding.parse(input);
                    if (pad) {
                        return pad;
                    }
                }
                throw new RuntimeError(`Could not parse padding from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'numberArray': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);

                    const val = NumberArray.parse(input);
                    if (val) {
                        return val;
                    }
                }
                throw new RuntimeError(`Could not parse numberArray from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'colorArray': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);

                    const val = ColorArray.parse(input);
                    if (val) {
                        return val;
                    }
                }
                throw new RuntimeError(`Could not parse colorArray from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'variableAnchorOffsetCollection': {
                let input;
                for (const arg of this.args) {
                    input = arg.evaluate(ctx);

                    const coll = VariableAnchorOffsetCollection.parse(input);
                    if (coll) {
                        return coll;
                    }
                }
                throw new RuntimeError(`Could not parse variableAnchorOffsetCollection from value '${typeof input === 'string' ? input : JSON.stringify(input)}'`);
            }
            case 'number': {
                let value = null;
                for (const arg of this.args) {
                    value = arg.evaluate(ctx);
                    if (value === null) return 0;
                    const num = Number(value);
                    if (isNaN(num)) continue;
                    return num;
                }
                throw new RuntimeError(`Could not convert ${JSON.stringify(value)} to number.`);
            }
            case 'formatted':
                // There is no explicit 'to-formatted' but this coercion can be implicitly
                // created by properties that expect the 'formatted' type.
                return Formatted.fromString(valueToString(this.args[0].evaluate(ctx)));
            case 'resolvedImage':
                return ResolvedImage.fromString(valueToString(this.args[0].evaluate(ctx)));
            case 'projectionDefinition':
                return this.args[0].evaluate(ctx);
            default:
                return valueToString(this.args[0].evaluate(ctx));
        }
    }

    eachChild(fn: (_: Expression) => void) {
        this.args.forEach(fn);
    }

    outputDefined(): boolean {
        return this.args.every(arg => arg.outputDefined());
    }
}


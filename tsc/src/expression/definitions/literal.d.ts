import type { Type } from '../types';
import type { Value } from '../values';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
declare class Literal implements Expression {
    type: Type;
    value: Value;
    constructor(type: Type, value: Value);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(): Value;
    eachChild(): void;
    outputDefined(): boolean;
}
export default Literal;

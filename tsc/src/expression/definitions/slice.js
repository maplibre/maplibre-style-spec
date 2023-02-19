import { ValueType, NumberType, StringType, array, toString, isValidType, isValidNativeType, } from '../types';
import RuntimeError from '../runtime_error';
import { typeOf } from '../values';
class Slice {
    constructor(type, input, beginIndex, endIndex) {
        this.type = type;
        this.input = input;
        this.beginIndex = beginIndex;
        this.endIndex = endIndex;
    }
    static parse(args, context) {
        if (args.length <= 2 || args.length >= 5) {
            return context.error(`Expected 3 or 4 arguments, but found ${args.length - 1} instead.`);
        }
        const input = context.parse(args[1], 1, ValueType);
        const beginIndex = context.parse(args[2], 2, NumberType);
        if (!input || !beginIndex)
            return null;
        if (!isValidType(input.type, [array(ValueType), StringType, ValueType])) {
            return context.error(`Expected first argument to be of type array or string, but found ${toString(input.type)} instead`);
        }
        if (args.length === 4) {
            const endIndex = context.parse(args[3], 3, NumberType);
            if (!endIndex)
                return null;
            return new Slice(input.type, input, beginIndex, endIndex);
        }
        else {
            return new Slice(input.type, input, beginIndex);
        }
    }
    evaluate(ctx) {
        const input = this.input.evaluate(ctx);
        const beginIndex = this.beginIndex.evaluate(ctx);
        if (!isValidNativeType(input, ['string', 'array'])) {
            throw new RuntimeError(`Expected first argument to be of type array or string, but found ${toString(typeOf(input))} instead.`);
        }
        if (this.endIndex) {
            const endIndex = this.endIndex.evaluate(ctx);
            return input.slice(beginIndex, endIndex);
        }
        return input.slice(beginIndex);
    }
    eachChild(fn) {
        fn(this.input);
        fn(this.beginIndex);
        if (this.endIndex) {
            fn(this.endIndex);
        }
    }
    outputDefined() {
        return false;
    }
}
export default Slice;
//# sourceMappingURL=slice.js.map
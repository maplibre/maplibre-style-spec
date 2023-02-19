import { array, ValueType, NumberType } from '../types';
import RuntimeError from '../runtime_error';
class At {
    constructor(type, index, input) {
        this.type = type;
        this.index = index;
        this.input = input;
    }
    static parse(args, context) {
        if (args.length !== 3)
            return context.error(`Expected 2 arguments, but found ${args.length - 1} instead.`);
        const index = context.parse(args[1], 1, NumberType);
        const input = context.parse(args[2], 2, array(context.expectedType || ValueType));
        if (!index || !input)
            return null;
        const t = input.type;
        return new At(t.itemType, index, input);
    }
    evaluate(ctx) {
        const index = this.index.evaluate(ctx);
        const array = this.input.evaluate(ctx);
        if (index < 0) {
            throw new RuntimeError(`Array index out of bounds: ${index} < 0.`);
        }
        if (index >= array.length) {
            throw new RuntimeError(`Array index out of bounds: ${index} > ${array.length - 1}.`);
        }
        if (index !== Math.floor(index)) {
            throw new RuntimeError(`Array index must be an integer, but found ${index} instead.`);
        }
        return array[index];
    }
    eachChild(fn) {
        fn(this.index);
        fn(this.input);
    }
    outputDefined() {
        return false;
    }
}
export default At;
//# sourceMappingURL=at.js.map
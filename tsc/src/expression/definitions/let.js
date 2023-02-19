class Let {
    constructor(bindings, result) {
        this.type = result.type;
        this.bindings = [].concat(bindings);
        this.result = result;
    }
    evaluate(ctx) {
        return this.result.evaluate(ctx);
    }
    eachChild(fn) {
        for (const binding of this.bindings) {
            fn(binding[1]);
        }
        fn(this.result);
    }
    static parse(args, context) {
        if (args.length < 4)
            return context.error(`Expected at least 3 arguments, but found ${args.length - 1} instead.`);
        const bindings = [];
        for (let i = 1; i < args.length - 1; i += 2) {
            const name = args[i];
            if (typeof name !== 'string') {
                return context.error(`Expected string, but found ${typeof name} instead.`, i);
            }
            if (/[^a-zA-Z0-9_]/.test(name)) {
                return context.error('Variable names must contain only alphanumeric characters or \'_\'.', i);
            }
            const value = context.parse(args[i + 1], i + 1);
            if (!value)
                return null;
            bindings.push([name, value]);
        }
        const result = context.parse(args[args.length - 1], args.length - 1, context.expectedType, bindings);
        if (!result)
            return null;
        return new Let(bindings, result);
    }
    outputDefined() {
        return this.result.outputDefined();
    }
}
export default Let;
//# sourceMappingURL=let.js.map
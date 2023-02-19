class Var {
    constructor(name, boundExpression) {
        this.type = boundExpression.type;
        this.name = name;
        this.boundExpression = boundExpression;
    }
    static parse(args, context) {
        if (args.length !== 2 || typeof args[1] !== 'string')
            return context.error('\'var\' expression requires exactly one string literal argument.');
        const name = args[1];
        if (!context.scope.has(name)) {
            return context.error(`Unknown variable "${name}". Make sure "${name}" has been bound in an enclosing "let" expression before using it.`, 1);
        }
        return new Var(name, context.scope.get(name));
    }
    evaluate(ctx) {
        return this.boundExpression.evaluate(ctx);
    }
    eachChild() { }
    outputDefined() {
        return false;
    }
}
export default Var;
//# sourceMappingURL=var.js.map
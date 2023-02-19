import { StringType, BooleanType, CollatorType } from '../types';
import Collator from '../types/collator';
export default class CollatorExpression {
    constructor(caseSensitive, diacriticSensitive, locale) {
        this.type = CollatorType;
        this.locale = locale;
        this.caseSensitive = caseSensitive;
        this.diacriticSensitive = diacriticSensitive;
    }
    static parse(args, context) {
        if (args.length !== 2)
            return context.error('Expected one argument.');
        const options = args[1];
        if (typeof options !== 'object' || Array.isArray(options))
            return context.error('Collator options argument must be an object.');
        const caseSensitive = context.parse(options['case-sensitive'] === undefined ? false : options['case-sensitive'], 1, BooleanType);
        if (!caseSensitive)
            return null;
        const diacriticSensitive = context.parse(options['diacritic-sensitive'] === undefined ? false : options['diacritic-sensitive'], 1, BooleanType);
        if (!diacriticSensitive)
            return null;
        let locale = null;
        if (options['locale']) {
            locale = context.parse(options['locale'], 1, StringType);
            if (!locale)
                return null;
        }
        return new CollatorExpression(caseSensitive, diacriticSensitive, locale);
    }
    evaluate(ctx) {
        return new Collator(this.caseSensitive.evaluate(ctx), this.diacriticSensitive.evaluate(ctx), this.locale ? this.locale.evaluate(ctx) : null);
    }
    eachChild(fn) {
        fn(this.caseSensitive);
        fn(this.diacriticSensitive);
        if (this.locale) {
            fn(this.locale);
        }
    }
    outputDefined() {
        // Technically the set of possible outputs is the combinatoric set of Collators produced
        // by all possible outputs of locale/caseSensitive/diacriticSensitive
        // But for the primary use of Collators in comparison operators, we ignore the Collator's
        // possible outputs anyway, so we can get away with leaving this false for now.
        return false;
    }
}
//# sourceMappingURL=collator.js.map
import {CompoundExpression} from '../expression/compound_expression';
import {Assertion} from '../expression/definitions/assertion';
import {Case} from '../expression/definitions/case';
import {Coalesce} from '../expression/definitions/coalesce';
import {GlobalState} from '../expression/definitions/global_state';
import {Match} from '../expression/definitions/match';
import {EvaluationContext} from '../expression/evaluation_context';
import {checkSubtype} from '../expression/types';
import {typeOf, type Value} from '../expression/values';
import type {Expression} from '../expression/expression';
import type {Feature, GlobalProperties} from '../expression';
import type {ICanonicalTileID} from '../tiles_and_coordinates';

/**
 * The value of a subexpression that depends on the map's zoom or global state, which are not known
 */
const UNKNOWN = Symbol('unknown');

/**
 * Finds the subexpressions that depend on the zoom or on global state.
 * @param expression The expression to search
 * @param dependent The set to add them to
 * @returns The subexpressions of `expression` that depend on the zoom or on global state
 */
function findDependent(expression: Expression, dependent = new Set<Expression>()): Set<Expression> {
    let depends =
        expression instanceof GlobalState ||
        (expression instanceof CompoundExpression && expression.name === 'zoom');
    expression.eachChild((child) => {
        findDependent(child, dependent);
        if (dependent.has(child)) depends = true;
    });
    if (depends) dependent.add(expression);
    return dependent;
}

/**
 * Evaluates `expression` without knowing the zoom or global state: a subexpression independent of
 * them is evaluated as usual, the boolean, branching and type assertion expressions combine what is
 * known of their arguments, and anything else that depends on them is UNKNOWN. A subexpression
 * that fails to evaluate is UNKNOWN too.
 * @param expression The expression to evaluate
 * @param ctx The evaluation context, with the feature
 * @param dependent The subexpressions that depend on the zoom or on global state
 * @returns The value, or UNKNOWN
 */
function evaluate(
    expression: Expression,
    ctx: EvaluationContext,
    dependent: Set<Expression>
): unknown {
    if (!dependent.has(expression)) {
        try {
            return expression.evaluate(ctx);
        } catch {
            return UNKNOWN;
        }
    }

    if (expression instanceof CompoundExpression) {
        switch (expression.name) {
            case 'all': {
                let result: unknown = true;
                for (const arg of expression.args) {
                    const value = evaluate(arg, ctx, dependent);
                    if (value === UNKNOWN) result = UNKNOWN;
                    else if (!value) return false;
                }
                return result;
            }
            case 'any': {
                let result: unknown = false;
                for (const arg of expression.args) {
                    const value = evaluate(arg, ctx, dependent);
                    if (value === UNKNOWN) result = UNKNOWN;
                    else if (value) return true;
                }
                return result;
            }
            case '!': {
                const value = evaluate(expression.args[0], ctx, dependent);
                return value === UNKNOWN ? UNKNOWN : !value;
            }
        }
        return UNKNOWN;
    }

    if (expression instanceof Assertion) {
        for (const arg of expression.args) {
            const value = evaluate(arg, ctx, dependent);
            if (value === UNKNOWN) return UNKNOWN;
            if (!checkSubtype(expression.type, typeOf(value as Value))) return value;
        }
        return UNKNOWN;
    }

    if (expression instanceof Case) {
        for (const [test, output] of expression.branches) {
            const value = evaluate(test, ctx, dependent);
            if (value === UNKNOWN) return UNKNOWN;
            if (value) return evaluate(output, ctx, dependent);
        }
        return evaluate(expression.otherwise, ctx, dependent);
    }

    if (expression instanceof Match) {
        const input = evaluate(expression.input, ctx, dependent) as any;
        if (input === UNKNOWN) return UNKNOWN;
        const output =
            (typeOf(input) === expression.inputType &&
                expression.outputs[expression.cases[input]]) ||
            expression.otherwise;
        return evaluate(output, ctx, dependent);
    }

    if (expression instanceof Coalesce) {
        for (const arg of expression.args) {
            const value = evaluate(arg, ctx, dependent);
            if (value === UNKNOWN) return UNKNOWN;
            if (value !== null) return value;
        }
        return null;
    }

    return UNKNOWN;
}

/**
 * Whether a feature passes a filter whatever the map's zoom and global state are: true if it passes
 * under all of them, false if it passes under none, null if that depends on them (or cannot be
 * decided).
 * @param expression The filter expression
 * @returns The `mayMatch` function of the filter
 */
export function createMayMatch(
    expression: Expression
): (feature: Feature, canonical?: ICanonicalTileID) => boolean | null {
    // found on first use, so filters that are only evaluated cost nothing
    let dependent: Set<Expression> = null;
    const ctx = new EvaluationContext();
    return (feature, canonical) => {
        dependent ??= findDependent(expression);
        ctx.globals = {} as GlobalProperties;
        ctx.feature = feature;
        ctx.featureState = null;
        ctx.canonical = canonical;
        // a filter independent of them fails on errors, as `filter` does
        if (!dependent.has(expression)) {
            try {
                return expression.evaluate(ctx) === true;
            } catch {
                return false;
            }
        }
        const value = evaluate(expression, ctx, dependent);
        return value === UNKNOWN ? null : value === true;
    };
}

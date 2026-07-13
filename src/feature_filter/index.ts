import {createExpression, findGlobalStateRefs} from '../expression';
import type {GlobalProperties, Feature} from '../expression';
import {ICanonicalTileID} from '../tiles_and_coordinates';
import {StylePropertySpecification} from '..';
import {ExpressionFilterSpecification, type FilterSpecification} from '../types.g';

type FilterExpression = (
    globalProperties: GlobalProperties,
    feature: Feature,
    canonical?: ICanonicalTileID
) => boolean;

export type FeatureFilter = {
    filter: FilterExpression;
    needGeometry: boolean;
    getGlobalStateRefs: () => Set<string>;
};

type MixedFilterDiagnostic = {
    path: Array<number>;
    legacyFilter: Array<any>;
};

/**
 * Which of the two filter syntaxes a filter node belongs to.
 *
 * - `expression`: only valid as an expression, e.g. `["==", ["get", "x"], 1]`.
 * - `legacy`: only valid as a deprecated filter, e.g. `["!in", "x", 1]`.
 * - `neutral`: valid as both *and* means the same thing in each, e.g. `["has", "x"]` or a
 *   bare boolean. Reading it either way gives the same result, so it is no evidence of which
 *   syntax the author was writing, and it must never decide the syntax of the tree it sits in.
 *
 * Note that "parses as both" is not enough to be `neutral`: `["in", "name", ""]` parses as
 * both, but legacy reads it as a property test and an expression reads it as a substring
 * test, so the two disagree. A node whose readings disagree stays `legacy` -- see `in` below.
 */
type FilterClassification = 'expression' | 'legacy' | 'neutral';

function classifyChildren(children: Array<any>): FilterClassification {
    let sawLegacy = false;
    for (const child of children) {
        const classification = classifyFilter(child);
        // A single expression-only child settles it for the whole tree.
        if (classification === 'expression') return 'expression';
        if (classification === 'legacy') sawLegacy = true;
    }
    return sawLegacy ? 'legacy' : 'neutral';
}

function classifyFilter(filter: any): FilterClassification {
    if (typeof filter === 'boolean') {
        return 'neutral';
    }

    if (!Array.isArray(filter) || filter.length === 0) {
        return 'legacy';
    }

    switch (filter[0]) {
        case 'has':
            if (filter.length < 2 || filter[1] === '$id' || filter[1] === '$type') {
                return 'legacy';
            }
            // Both syntaxes read the two-element form as "this property is present"; only the
            // expression takes a third argument.
            return filter.length === 2 ? 'neutral' : 'expression';

        case 'in':
            // Legacy `["in", key, ...values]` tests a property against a set, while the `in`
            // expression tests for a substring, so the scalar form is a conflict rather than a
            // neutral node. Keeping it legacy is what makes plain legacy `in` filters keep
            // matching, and what lets findMixedLegacyFilter report one inside an expression.
            return filter.length >= 3 && (typeof filter[1] !== 'string' || Array.isArray(filter[2]))
                ? 'expression'
                : 'legacy';

        case '!in':
        case '!has':
            return 'legacy';

        case '==':
        case '!=':
        case '>':
        case '>=':
        case '<':
        case '<=':
            return filter.length !== 3 || Array.isArray(filter[1]) || Array.isArray(filter[2])
                ? 'expression'
                : 'legacy';

        case 'none':
            return 'legacy';
        case 'any':
        case 'all':
            return classifyChildren(filter.slice(1));

        default:
            return 'expression';
    }
}

export function isExpressionFilter(filter: any): filter is ExpressionFilterSpecification {
    return classifyFilter(filter) !== 'legacy';
}

function getFilterPropertyExpression(property: string): unknown {
    if (property === '$type') return ['geometry-type'];
    if (property === '$id') return ['id'];
    return ['get', property];
}

function getLegacyFilterExpressionSuggestion(filter: Array<any>): unknown {
    switch (filter[0]) {
        case '==':
        case '!=':
        case '<':
        case '<=':
        case '>':
        case '>=':
            if (filter.length !== 3 || typeof filter[1] !== 'string') return null;
            return [filter[0], getFilterPropertyExpression(filter[1]), filter[2]];

        case 'in':
        case '!in': {
            if (filter.length < 2 || typeof filter[1] !== 'string') return null;
            const expression = [
                'in',
                getFilterPropertyExpression(filter[1]),
                ['literal', filter.slice(2)]
            ];
            return filter[0] === '!in' ? ['!', expression] : expression;
        }

        case 'has':
        case '!has': {
            if (filter.length !== 2 || typeof filter[1] !== 'string') return null;
            if (filter[1] === '$type' || filter[1] === '$id') return null;
            const expression = ['has', filter[1]];
            return filter[0] === '!has' ? ['!', expression] : expression;
        }

        default:
            return null;
    }
}

export function getMixedFilterMessage(filter: Array<any>): string {
    if (
        (filter[0] === '<' || filter[0] === '<=' || filter[0] === '>' || filter[0] === '>=') &&
        filter[1] === '$type'
    ) {
        return `"$type" cannot be use with operator "${filter[0]}"`;
    }

    const suggestion = getLegacyFilterExpressionSuggestion(filter);
    if (suggestion) {
        return `Mixing deprecated filter syntax with expression syntax is not supported. Replace ${JSON.stringify(filter)} with ${JSON.stringify(suggestion)}.`;
    }

    return `Mixing deprecated filter syntax with expression syntax is not supported. Convert ${JSON.stringify(filter)} to expression syntax.`;
}

function checkChild(
    index: number,
    path: Array<number>,
    filter: unknown
): MixedFilterDiagnostic | null {
    const child = filter[index];
    if (!Array.isArray(child)) {
        return null;
    }
    if (!isExpressionFilter(child)) {
        return {path: path.concat(index), legacyFilter: child};
    }
    return findMixedLegacyFilter(child, path.concat(index));
}

export function findMixedLegacyFilter(
    filter: unknown,
    path: Array<number> = []
): MixedFilterDiagnostic | null {
    if (!Array.isArray(filter) || filter.length < 1) {
        return null;
    }

    switch (filter[0]) {
        case 'all':
        case 'any':
        case 'none':
            for (let i = 1; i < filter.length; i++) {
                const diagnostic = checkChild(i, path, filter);
                if (diagnostic) return diagnostic;
            }
            break;

        case '!': {
            const diagnostic = checkChild(1, path, filter);
            if (diagnostic) return diagnostic;
            break;
        }

        case 'case':
            for (let i = 1; i < filter.length - 1; i += 2) {
                const diagnostic = checkChild(i, path, filter);
                if (diagnostic) return diagnostic;
            }
            break;
    }

    return null;
}

export function warnAboutMixedLegacyFilter(filter: FilterSpecification, rootKey: string) {
    const diagnostic = findMixedLegacyFilter(filter);
    if (!diagnostic || typeof console === 'undefined') {
        return;
    }
    const path = diagnostic.path.map((index) => `[${index}]`).join('');
    console.warn(`${rootKey}${path}: ${getMixedFilterMessage(diagnostic.legacyFilter)}`);
}

const filterSpec = {
    type: 'boolean',
    default: false,
    transition: false,
    'property-type': 'data-driven',
    expression: {
        interpolated: false,
        parameters: ['zoom', 'feature']
    }
};

/**
 * Given a filter expressed as nested arrays, return a new function
 * that evaluates whether a given feature (with a .properties or .tags property)
 * passes its test.
 *
 * @private
 * @param filter MapLibre filter
 * @param rootKey Location of the filter in the style JSON (e.g. `layers[3].filter`),
 * used to prefix runtime warnings
 * @param [globalState] Global state object to be used for evaluating 'global-state' expressions
 * @returns filter-evaluating function
 */
export function featureFilter(
    filter: FilterSpecification | void,
    rootKey: string,
    globalState?: Record<string, any>
): FeatureFilter {
    if (filter === null || filter === undefined) {
        return {filter: () => true, needGeometry: false, getGlobalStateRefs: () => new Set()};
    }

    if (!isExpressionFilter(filter)) {
        filter = convertFilter(filter) as ExpressionFilterSpecification;
    } else {
        warnAboutMixedLegacyFilter(filter, rootKey);
    }

    const compiled = createExpression(
        filter,
        rootKey,
        filterSpec as StylePropertySpecification,
        globalState
    );
    if (compiled.result === 'error') {
        throw new Error(compiled.value.map((err) => `${err.key}: ${err.message}`).join(', '));
    } else {
        const needGeometry = geometryNeeded(filter);
        return {
            filter: (
                globalProperties: GlobalProperties,
                feature: Feature,
                canonical?: ICanonicalTileID
            ) => compiled.value.evaluate(globalProperties, feature, {}, canonical),
            needGeometry,
            getGlobalStateRefs: () => findGlobalStateRefs(compiled.value.expression)
        };
    }
}

// Comparison function to sort numbers and strings
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

function geometryNeeded(filter) {
    if (!Array.isArray(filter)) return false;
    if (filter[0] === 'within' || filter[0] === 'distance') return true;
    for (let index = 1; index < filter.length; index++) {
        if (geometryNeeded(filter[index])) return true;
    }
    return false;
}

function convertFilter(filter?: Array<any> | null | void): unknown {
    if (!filter) return true;
    const op = filter[0];
    if (filter.length <= 1) return op !== 'any';
    const converted =
        op === '=='
            ? convertComparisonOp(filter[1], filter[2], '==')
            : op === '!='
              ? convertNegation(convertComparisonOp(filter[1], filter[2], '=='))
              : op === '<' || op === '>' || op === '<=' || op === '>='
                ? convertComparisonOp(filter[1], filter[2], op)
                : op === 'any'
                  ? convertDisjunctionOp(filter.slice(1))
                  : op === 'all'
                    ? ['all' as unknown].concat(filter.slice(1).map(convertFilter))
                    : op === 'none'
                      ? ['all' as unknown].concat(
                            filter.slice(1).map(convertFilter).map(convertNegation)
                        )
                      : op === 'in'
                        ? convertInOp(filter[1], filter.slice(2))
                        : op === '!in'
                          ? convertNegation(convertInOp(filter[1], filter.slice(2)))
                          : op === 'has'
                            ? convertHasOp(filter[1])
                            : op === '!has'
                              ? convertNegation(convertHasOp(filter[1]))
                              : true;
    return converted;
}

function convertComparisonOp(property: string, value: any, op: string) {
    switch (property) {
        case '$type':
            return [`filter-type-${op}`, value];
        case '$id':
            return [`filter-id-${op}`, value];
        default:
            return [`filter-${op}`, property, value];
    }
}

function convertDisjunctionOp(filters: Array<Array<any>>) {
    return ['any' as unknown].concat(filters.map(convertFilter));
}

function convertInOp(property: string, values: Array<any>) {
    if (values.length === 0) {
        return false;
    }
    switch (property) {
        case '$type':
            return ['filter-type-in', ['literal', values]];
        case '$id':
            return ['filter-id-in', ['literal', values]];
        default:
            if (values.length > 200 && !values.some((v) => typeof v !== typeof values[0])) {
                return ['filter-in-large', property, ['literal', values.sort(compare)]];
            } else {
                return ['filter-in-small', property, ['literal', values]];
            }
    }
}

function convertHasOp(property: string) {
    switch (property) {
        case '$type':
            return true;
        case '$id':
            return ['filter-has-id'];
        default:
            return ['filter-has', property];
    }
}

function convertNegation(filter: unknown) {
    return ['!', filter];
}

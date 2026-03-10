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

export function isExpressionFilter(filter: any): filter is ExpressionFilterSpecification {
    if (filter === true || filter === false) {
        return true;
    }

    if (!Array.isArray(filter) || filter.length === 0) {
        return false;
    }
    switch (filter[0]) {
        case 'has':
            return filter.length >= 2 && filter[1] !== '$id' && filter[1] !== '$type';

        case 'in':
            return (
                filter.length >= 3 && (typeof filter[1] !== 'string' || Array.isArray(filter[2]))
            );

        case '!in':
        case '!has':
            return false;

        case '==':
        case '!=':
        case '>':
        case '>=':
        case '<':
        case '<=':
            return filter.length !== 3 || Array.isArray(filter[1]) || Array.isArray(filter[2]);

        case 'none': {
            for (const f of filter.slice(1)) {
                if (typeof f === 'boolean') continue;
                if (isExpressionFilter(f)) {
                    return true;
                }
            }
            return false;
        }

        case 'any':
        case 'all': {
            let hasLegacy = false;
            for (const f of filter.slice(1)) {
                if (typeof f === 'boolean') continue;
                if (isExpressionFilter(f)) {
                    // If any child is definitely an expression, treat the whole filter as an expression
                    // that will go through extensive validation to surface mixed syntax issues.
                    return true;
                }
                hasLegacy = true;
            }
            return !hasLegacy;
        }

        default:
            return true;
    }
}

function getFilterPropertyExpression(property: string): unknown {
    switch (property) {
        case '$type':
            return ['geometry-type'];
        case '$id':
            return ['id'];
        default:
            return ['get', property];
    }
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
            if (
                (filter[0] === '<' || filter[0] === '<=' || filter[0] === '>' || filter[0] === '>=') &&
                filter[1] === '$type'
            ) {
                return null;
            }
            return [filter[0], getFilterPropertyExpression(filter[1]), filter[2]];

        case 'in':
        case '!in': {
            if (filter.length < 2 || typeof filter[1] !== 'string') return null;
            const expression = ['in', getFilterPropertyExpression(filter[1]), ['literal', filter.slice(2)]];
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

export function getMixedFilterErrorMessage(filter: Array<any>): string {
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

export function findMixedLegacyFilter(filter: unknown, path: Array<number> = []): MixedFilterDiagnostic | null {
    if (!Array.isArray(filter) || filter.length < 1) {
        return null;
    }

    const checkChild = (index: number) => {
        const child = filter[index];
        if (!Array.isArray(child)) {
            return null;
        }
        if (!isExpressionFilter(child)) {
            return {path: path.concat(index), legacyFilter: child};
        }
        return findMixedLegacyFilter(child, path.concat(index));
    };

    switch (filter[0]) {
        case 'all':
        case 'any':
        case 'none':
            for (let i = 1; i < filter.length; i++) {
                const diagnostic = checkChild(i);
                if (diagnostic) return diagnostic;
            }
            break;

        case '!': {
            const diagnostic = checkChild(1);
            if (diagnostic) return diagnostic;
            break;
        }

        case 'case':
            for (let i = 1; i < filter.length - 1; i += 2) {
                const diagnostic = checkChild(i);
                if (diagnostic) return diagnostic;
            }
            break;
    }

    return null;
}

export function validateNoMixedExpressionFilter(filter: unknown) {
    const diagnostic = findMixedLegacyFilter(filter);
    if (diagnostic) {
        throw new Error(getMixedFilterErrorMessage(diagnostic.legacyFilter));
    }
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
 * @param [globalState] Global state object to be used for evaluating 'global-state' expressions
 * @returns filter-evaluating function
 */
export function featureFilter(
    filter: FilterSpecification | void,
    globalState?: Record<string, any>
): FeatureFilter {
    if (filter === null || filter === undefined) {
        return {filter: () => true, needGeometry: false, getGlobalStateRefs: () => new Set()};
    }

    if (Array.isArray(filter) && filter[0] === 'none' && isExpressionFilter(filter)) {
        validateNoMixedExpressionFilter(filter);
        filter = convertFilter(filter as Array<any>) as ExpressionFilterSpecification;
    } else if (!isExpressionFilter(filter)) {
        filter = convertFilter(filter) as ExpressionFilterSpecification;
    } else {
        validateNoMixedExpressionFilter(filter);
    }

    const compiled = createExpression(
        filter,
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

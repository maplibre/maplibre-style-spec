import { isExpressionFilter } from './index';
/*
 * Convert the given filter to an expression, storing the expected types for
 * any feature properties referenced in expectedTypes.
 *
 * These expected types are needed in order to construct preflight type checks
 * needed for handling 'any' filters. A preflight type check is necessary in
 * order to mimic legacy filters' semantics around expected type mismatches.
 * For example, consider the legacy filter:
 *
 *     ["any", ["all", [">", "y", 0], [">", "y", 0]], [">", "x", 0]]
 *
 * Naively, we might convert this to the expression:
 *
 *     ["any", ["all", [">", ["get", "y"], 0], [">", ["get", "z"], 0]], [">", ["get", "x"], 0]]
 *
 * But if we tried to evaluate this against, say `{x: 1, y: null, z: 0}`, the
 * [">", ["get", "y"], 0] would cause an evaluation error, leading to the
 * entire filter returning false. Legacy filter semantics, though, ask for
 * [">", "y", 0] to simply return `false` when `y` is of the wrong type,
 * allowing the subsequent terms of the outer "any" expression to be evaluated
 * (resulting, in this case, in a `true` value, because x > 0).
 *
 * We account for this by inserting a preflight type-checking expression before
 * each "any" term, allowing us to avoid evaluating the actual converted filter
 * if any type mismatches would cause it to produce an evalaution error:
 *
 *     ["any",
 *       ["case",
 *         ["all", ["==", ["typeof", ["get", "y"]], "number"], ["==", ["typeof", ["get", "z"], "number]],
 *         ["all", [">", ["get", "y"], 0], [">", ["get", "z"], 0]],
 *         false
 *       ],
 *       ["case",
 *         ["==", ["typeof", ["get", "x"], "number"]],
 *         [">", ["get", "x"], 0],
 *         false
 *       ]
 *     ]
 *
 * An alternative, possibly more direct approach would be to use type checks
 * in the conversion of each comparison operator, so that the converted version
 * of each individual ==, >=, etc. would mimic the legacy filter semantics. The
 * downside of this approach is that it can lead to many more type checks than
 * would otherwise be necessary: outside the context of an "any" expression,
 * bailing out due to a runtime type error (expression semantics) and returning
 * false (legacy filter semantics) are equivalent: they cause the filter to
 * produce a `false` result.
 */
export default function convertFilter(filter, expectedTypes = {}) {
    if (isExpressionFilter(filter))
        return filter;
    if (!filter)
        return true;
    const legacyFilter = filter;
    const legacyOp = legacyFilter[0];
    if (filter.length <= 1)
        return (legacyOp !== 'any');
    switch (legacyOp) {
        case '==':
        case '!=':
        case '<':
        case '>':
        case '<=':
        case '>=': {
            const [, property, value] = filter;
            return convertComparisonOp(property, value, legacyOp, expectedTypes);
        }
        case 'any': {
            const [, ...conditions] = legacyFilter;
            const children = conditions.map((f) => {
                const types = {};
                const child = convertFilter(f, types);
                const typechecks = runtimeTypeChecks(types);
                return typechecks === true ? child : ['case', typechecks, child, false];
            });
            return ['any', ...children];
        }
        case 'all': {
            const [, ...conditions] = legacyFilter;
            const children = conditions.map(f => convertFilter(f, expectedTypes));
            return children.length > 1 ? ['all', ...children] : children[0];
        }
        case 'none': {
            const [, ...conditions] = legacyFilter;
            return ['!', convertFilter(['any', ...conditions], {})];
        }
        case 'in': {
            const [, property, ...values] = legacyFilter;
            return convertInOp(property, values);
        }
        case '!in': {
            const [, property, ...values] = legacyFilter;
            return convertInOp(property, values, true);
        }
        case 'has':
            return convertHasOp(legacyFilter[1]);
        case '!has':
            return ['!', convertHasOp(legacyFilter[1])];
        default:
            return true;
    }
}
// Given a set of feature properties and an expected type for each one,
// construct an boolean expression that tests whether each property has the
// right type.
// E.g.: for {name: 'string', population: 'number'}, return
// [ 'all',
//   ['==', ['typeof', ['get', 'name'], 'string']],
//   ['==', ['typeof', ['get', 'population'], 'number]]
// ]
function runtimeTypeChecks(expectedTypes) {
    const conditions = [];
    for (const property in expectedTypes) {
        const get = property === '$id' ? ['id'] : ['get', property];
        conditions.push(['==', ['typeof', get], expectedTypes[property]]);
    }
    if (conditions.length === 0)
        return true;
    if (conditions.length === 1)
        return conditions[0];
    return ['all', ...conditions];
}
function convertComparisonOp(property, value, op, expectedTypes) {
    let get;
    if (property === '$type') {
        return [op, ['geometry-type'], value];
    }
    else if (property === '$id') {
        get = ['id'];
    }
    else {
        get = ['get', property];
    }
    if (expectedTypes && value !== null) {
        const type = typeof value;
        expectedTypes[property] = type;
    }
    if (op === '==' && property !== '$id' && value === null) {
        return [
            'all',
            ['has', property],
            ['==', get, null]
        ];
    }
    else if (op === '!=' && property !== '$id' && value === null) {
        return [
            'any',
            ['!', ['has', property]],
            ['!=', get, null]
        ];
    }
    return [op, get, value];
}
function convertInOp(property, values, negate = false) {
    if (values.length === 0)
        return negate;
    let get;
    if (property === '$type') {
        get = ['geometry-type'];
    }
    else if (property === '$id') {
        get = ['id'];
    }
    else {
        get = ['get', property];
    }
    // Determine if the list of values to be searched is homogenously typed.
    // If so (and if the type is string or number), then we can use a
    // [match, input, [...values], true, false] construction rather than a
    // bunch of `==` tests.
    let uniformTypes = true;
    const type = typeof values[0];
    for (const value of values) {
        if (typeof value !== type) {
            uniformTypes = false;
            break;
        }
    }
    if (uniformTypes && (type === 'string' || type === 'number')) {
        // Match expressions must have unique values.
        const uniqueValues = values.sort().filter((v, i) => i === 0 || values[i - 1] !== v);
        return ['match', get, uniqueValues, !negate, negate];
    }
    if (negate) {
        return ['all', ...values.map(v => ['!=', get, v])];
    }
    else {
        return ['any', ...values.map(v => ['==', get, v])];
    }
}
function convertHasOp(property) {
    if (property === '$type') {
        return true;
    }
    else if (property === '$id') {
        return ['!=', ['id'], null];
    }
    else {
        return ['has', property];
    }
}
//# sourceMappingURL=convert.js.map
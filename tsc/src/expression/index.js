import extend from '../util/extend';
import ExpressionParsingError from './parsing_error';
import ParsingContext from './parsing_context';
import EvaluationContext from './evaluation_context';
import CompoundExpression, { isFeatureConstant, isGlobalPropertyConstant, isStateConstant, isExpressionConstant } from './compound_expression';
import Step from './definitions/step';
import Interpolate from './definitions/interpolate';
import Coalesce from './definitions/coalesce';
import Let from './definitions/let';
import definitions from './definitions';
import RuntimeError from './runtime_error';
import { success, error } from '../util/result';
import { supportsPropertyExpression, supportsZoomExpression, supportsInterpolation } from '../util/properties';
export class StyleExpression {
    constructor(expression, propertySpec) {
        this.expression = expression;
        this._warningHistory = {};
        this._evaluator = new EvaluationContext();
        this._defaultValue = propertySpec ? getDefaultValue(propertySpec) : null;
        this._enumValues = propertySpec && propertySpec.type === 'enum' ? propertySpec.values : null;
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature;
        this._evaluator.featureState = featureState;
        this._evaluator.canonical = canonical;
        this._evaluator.availableImages = availableImages || null;
        this._evaluator.formattedSection = formattedSection;
        return this.expression.evaluate(this._evaluator);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        this._evaluator.globals = globals;
        this._evaluator.feature = feature || null;
        this._evaluator.featureState = featureState || null;
        this._evaluator.canonical = canonical;
        this._evaluator.availableImages = availableImages || null;
        this._evaluator.formattedSection = formattedSection || null;
        try {
            const val = this.expression.evaluate(this._evaluator);
            // eslint-disable-next-line no-self-compare
            if (val === null || val === undefined || (typeof val === 'number' && val !== val)) {
                return this._defaultValue;
            }
            if (this._enumValues && !(val in this._enumValues)) {
                throw new RuntimeError(`Expected value to be one of ${Object.keys(this._enumValues).map(v => JSON.stringify(v)).join(', ')}, but found ${JSON.stringify(val)} instead.`);
            }
            return val;
        }
        catch (e) {
            if (!this._warningHistory[e.message]) {
                this._warningHistory[e.message] = true;
                if (typeof console !== 'undefined') {
                    console.warn(e.message);
                }
            }
            return this._defaultValue;
        }
    }
}
export function isExpression(expression) {
    return Array.isArray(expression) && expression.length > 0 &&
        typeof expression[0] === 'string' && expression[0] in definitions;
}
/**
 * Parse and typecheck the given style spec JSON expression.  If
 * options.defaultValue is provided, then the resulting StyleExpression's
 * `evaluate()` method will handle errors by logging a warning (once per
 * message) and returning the default value.  Otherwise, it will throw
 * evaluation errors.
 *
 * @private
 */
export function createExpression(expression, propertySpec) {
    const parser = new ParsingContext(definitions, isExpressionConstant, [], propertySpec ? getExpectedType(propertySpec) : undefined);
    // For string-valued properties, coerce to string at the top level rather than asserting.
    const parsed = parser.parse(expression, undefined, undefined, undefined, propertySpec && propertySpec.type === 'string' ? { typeAnnotation: 'coerce' } : undefined);
    if (!parsed) {
        return error(parser.errors);
    }
    return success(new StyleExpression(parsed, propertySpec));
}
export class ZoomConstantExpression {
    constructor(kind, expression) {
        this.kind = kind;
        this._styleExpression = expression;
        this.isStateDependent = kind !== 'constant' && !isStateConstant(expression.expression);
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
}
export class ZoomDependentExpression {
    constructor(kind, expression, zoomStops, interpolationType) {
        this.kind = kind;
        this.zoomStops = zoomStops;
        this._styleExpression = expression;
        this.isStateDependent = kind !== 'camera' && !isStateConstant(expression.expression);
        this.interpolationType = interpolationType;
    }
    evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluateWithoutErrorHandling(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    evaluate(globals, feature, featureState, canonical, availableImages, formattedSection) {
        return this._styleExpression.evaluate(globals, feature, featureState, canonical, availableImages, formattedSection);
    }
    interpolationFactor(input, lower, upper) {
        if (this.interpolationType) {
            return Interpolate.interpolationFactor(this.interpolationType, input, lower, upper);
        }
        else {
            return 0;
        }
    }
}
export function createPropertyExpression(expressionInput, propertySpec) {
    const expression = createExpression(expressionInput, propertySpec);
    if (expression.result === 'error') {
        return expression;
    }
    const parsed = expression.value.expression;
    const isFeatureConstantResult = isFeatureConstant(parsed);
    if (!isFeatureConstantResult && !supportsPropertyExpression(propertySpec)) {
        return error([new ExpressionParsingError('', 'data expressions not supported')]);
    }
    const isZoomConstant = isGlobalPropertyConstant(parsed, ['zoom']);
    if (!isZoomConstant && !supportsZoomExpression(propertySpec)) {
        return error([new ExpressionParsingError('', 'zoom expressions not supported')]);
    }
    const zoomCurve = findZoomCurve(parsed);
    if (!zoomCurve && !isZoomConstant) {
        return error([new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]);
    }
    else if (zoomCurve instanceof ExpressionParsingError) {
        return error([zoomCurve]);
    }
    else if (zoomCurve instanceof Interpolate && !supportsInterpolation(propertySpec)) {
        return error([new ExpressionParsingError('', '"interpolate" expressions cannot be used with this property')]);
    }
    if (!zoomCurve) {
        return success(isFeatureConstantResult ?
            new ZoomConstantExpression('constant', expression.value) :
            new ZoomConstantExpression('source', expression.value));
    }
    const interpolationType = zoomCurve instanceof Interpolate ? zoomCurve.interpolation : undefined;
    return success(isFeatureConstantResult ?
        new ZoomDependentExpression('camera', expression.value, zoomCurve.labels, interpolationType) :
        new ZoomDependentExpression('composite', expression.value, zoomCurve.labels, interpolationType));
}
import { isFunction, createFunction } from '../function';
import { Color } from './values';
// serialization wrapper for old-style stop functions normalized to the
// expression interface
export class StylePropertyFunction {
    constructor(parameters, specification) {
        this._parameters = parameters;
        this._specification = specification;
        extend(this, createFunction(this._parameters, this._specification));
    }
    static deserialize(serialized) {
        return new StylePropertyFunction(serialized._parameters, serialized._specification);
    }
    static serialize(input) {
        return {
            _parameters: input._parameters,
            _specification: input._specification
        };
    }
}
export function normalizePropertyExpression(value, specification) {
    if (isFunction(value)) {
        return new StylePropertyFunction(value, specification);
    }
    else if (isExpression(value)) {
        const expression = createPropertyExpression(value, specification);
        if (expression.result === 'error') {
            // this should have been caught in validation
            throw new Error(expression.value.map(err => `${err.key}: ${err.message}`).join(', '));
        }
        return expression.value;
    }
    else {
        let constant = value;
        if (specification.type === 'color' && typeof value === 'string') {
            constant = Color.parse(value);
        }
        else if (specification.type === 'padding' && (typeof value === 'number' || Array.isArray(value))) {
            constant = Padding.parse(value);
        }
        return {
            kind: 'constant',
            evaluate: () => constant
        };
    }
}
// Zoom-dependent expressions may only use ["zoom"] as the input to a top-level "step" or "interpolate"
// expression (collectively referred to as a "curve"). The curve may be wrapped in one or more "let" or
// "coalesce" expressions.
function findZoomCurve(expression) {
    let result = null;
    if (expression instanceof Let) {
        result = findZoomCurve(expression.result);
    }
    else if (expression instanceof Coalesce) {
        for (const arg of expression.args) {
            result = findZoomCurve(arg);
            if (result) {
                break;
            }
        }
    }
    else if ((expression instanceof Step || expression instanceof Interpolate) &&
        expression.input instanceof CompoundExpression &&
        expression.input.name === 'zoom') {
        result = expression;
    }
    if (result instanceof ExpressionParsingError) {
        return result;
    }
    expression.eachChild((child) => {
        const childResult = findZoomCurve(child);
        if (childResult instanceof ExpressionParsingError) {
            result = childResult;
        }
        else if (!result && childResult) {
            result = new ExpressionParsingError('', '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.');
        }
        else if (result && childResult && result !== childResult) {
            result = new ExpressionParsingError('', 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.');
        }
    });
    return result;
}
import { ColorType, StringType, NumberType, BooleanType, ValueType, FormattedType, PaddingType, ResolvedImageType, array } from './types';
import Padding from '../util/padding';
function getExpectedType(spec) {
    const types = {
        color: ColorType,
        string: StringType,
        number: NumberType,
        enum: StringType,
        boolean: BooleanType,
        formatted: FormattedType,
        padding: PaddingType,
        resolvedImage: ResolvedImageType
    };
    if (spec.type === 'array') {
        return array(types[spec.value] || ValueType, spec.length);
    }
    return types[spec.type];
}
function getDefaultValue(spec) {
    if (spec.type === 'color' && isFunction(spec.default)) {
        // Special case for heatmap-color: it uses the 'default:' to define a
        // default color ramp, but createExpression expects a simple value to fall
        // back to in case of runtime errors
        return new Color(0, 0, 0, 0);
    }
    else if (spec.type === 'color') {
        return Color.parse(spec.default) || null;
    }
    else if (spec.type === 'padding') {
        return Padding.parse(spec.default) || null;
    }
    else if (spec.default === undefined) {
        return null;
    }
    else {
        return spec.default;
    }
}
//# sourceMappingURL=index.js.map
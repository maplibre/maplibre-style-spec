import v8Spec from './reference/v8.json' assert { type: 'json' };
const v8 = v8Spec;
import latest from './reference/latest';
import format from './format';
import migrate from './migrate';
import derefLayers from './deref';
import diff from './diff';
import ValidationError from './error/validation_error';
import ParsingError from './error/parsing_error';
import { StyleExpression, isExpression, createExpression, createPropertyExpression, normalizePropertyExpression, ZoomConstantExpression, ZoomDependentExpression, StylePropertyFunction } from './expression';
import featureFilter, { isExpressionFilter } from './feature_filter';
import convertFilter from './feature_filter/convert';
import Color from './util/color';
import Padding from './util/padding';
import { createFunction, isFunction } from './function';
import convertFunction from './function/convert';
import { eachSource, eachLayer, eachProperty } from './visit';
import validate from './validate_style';
const expression = {
    StyleExpression,
    isExpression,
    isExpressionFilter,
    createExpression,
    createPropertyExpression,
    normalizePropertyExpression,
    ZoomConstantExpression,
    ZoomDependentExpression,
    StylePropertyFunction
};
const styleFunction = {
    convertFunction,
    createFunction,
    isFunction
};
const visit = { eachSource, eachLayer, eachProperty };
export { v8, latest, format, migrate, derefLayers, diff, ValidationError, ParsingError, expression, featureFilter, convertFilter, Color, Padding, styleFunction as function, validate, visit };
//# sourceMappingURL=style-spec.js.map
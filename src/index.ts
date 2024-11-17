import v8Spec from './reference/v8.json' with {type: 'json'};
const v8 = v8Spec as any;
import latest from './reference/latest';
import {derefLayers} from './deref';
import {diff} from './diff';
import {ValidationError} from './error/validation_error';
import {ParsingError} from './error/parsing_error';
import {FeatureState, StyleExpression, isExpression, isZoomExpression, createExpression, createPropertyExpression, normalizePropertyExpression, ZoomConstantExpression, ZoomDependentExpression, StylePropertyFunction, Feature, GlobalProperties, SourceExpression, CompositeExpression, StylePropertyExpression} from './expression';
import {featureFilter, isExpressionFilter} from './feature_filter';

import {convertFilter} from './feature_filter/convert';
import {Color} from './expression/types/color';
import {Padding} from './expression/types/padding';
import {VariableAnchorOffsetCollection} from './expression/types/variable_anchor_offset_collection';
import {Formatted, FormattedSection} from './expression/types/formatted';
import {createFunction, isFunction} from './function';
import {convertFunction} from './function/convert';
import {eachSource, eachLayer, eachProperty} from './visit';
import {ResolvedImage} from './expression/types/resolved_image';
import {supportsPropertyExpression} from './util/properties';
import {IMercatorCoordinate, ICanonicalTileID, ILngLat, ILngLatLike} from './tiles_and_coordinates';
import {EvaluationContext} from './expression/evaluation_context';
import {FormattedType, NullType, Type, typeToString, ColorType, ProjectionDefinitionType} from './expression/types';

import {expressions} from './expression/definitions';
import {Interpolate} from './expression/definitions/interpolate';
import {interpolateFactory, type InterpolationType} from './expression/definitions/interpolate';

import {groupByLayout} from './group_by_layout';
import {emptyStyle} from './empty';
import {validateStyleMin} from './validate_style.min';
import {Step} from './expression/definitions/step';
import {typeOf} from './expression/values';
import {FormatExpression} from './expression/definitions/format';
import {Literal} from './expression/definitions/literal';
import {CompoundExpression} from './expression/compound_expression';
import {ColorSpecification, PaddingSpecification, ProjectionDefinitionSpecification, VariableAnchorOffsetCollectionSpecification} from './types.g';
import {format} from './format';
import {validate} from './validate/validate';
import {migrate} from './migrate';
import {classifyRings} from './util/classify_rings';
import {ProjectionDefinition} from './expression/types/projection_definition';

type ExpressionType = 'data-driven' | 'cross-faded' | 'cross-faded-data-driven' | 'color-ramp' | 'data-constant' | 'constant';
type ExpressionParameters = Array<'zoom' | 'feature' | 'feature-state' | 'heatmap-density' | 'line-progress'>;

type ExpressionSpecificationDefinition = {
    interpolated: boolean;
    parameters: ExpressionParameters;
};

export type StylePropertySpecification = {
    type: 'number';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: number;
} | {
    type: 'string';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: string;
    tokens?: boolean;
} | {
    type: 'boolean';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: boolean;
} | {
    type: 'enum';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    values: {[_: string]: {}};
    transition: boolean;
    default?: string;
} | {
    type: 'color';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: ColorSpecification;
    overridable: boolean;
} | {
    type: 'array';
    value: 'number';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    length?: number;
    transition: boolean;
    default?: Array<number>;
} | {
    type: 'array';
    value: 'string';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    length?: number;
    transition: boolean;
    default?: Array<string>;
} | {
    type: 'padding';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: PaddingSpecification;
} | {
    type: 'variableAnchorOffsetCollection';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: VariableAnchorOffsetCollectionSpecification;
} | {
    type: 'projectionDefinition';
    'property-type': ExpressionType;
    expression?: ExpressionSpecificationDefinition;
    transition: boolean;
    default?: ProjectionDefinitionSpecification;
};

const expression = {
    StyleExpression,
    StylePropertyFunction,
    ZoomConstantExpression,
    ZoomDependentExpression,
    createExpression,
    createPropertyExpression,
    isExpression,
    isExpressionFilter,
    isZoomExpression,
    normalizePropertyExpression,
};

const styleFunction = {
    convertFunction,
    createFunction,
    isFunction
};

const visit = {eachLayer, eachProperty, eachSource};

export {
    Interpolate,
    InterpolationType,
    ValidationError,
    ParsingError,
    FeatureState,
    ProjectionDefinition,
    Color,
    Step,
    CompoundExpression,
    Padding,
    VariableAnchorOffsetCollection,
    Formatted,
    ResolvedImage,
    Feature,
    EvaluationContext,
    GlobalProperties,
    SourceExpression,
    CompositeExpression,
    FormattedSection,
    IMercatorCoordinate,
    ICanonicalTileID,
    ILngLat,
    ILngLatLike,
    StyleExpression,
    ZoomConstantExpression,
    Literal,
    Type,
    StylePropertyFunction,
    StylePropertyExpression,
    ZoomDependentExpression,
    FormatExpression,

    latest,

    validateStyleMin,
    groupByLayout,
    emptyStyle,
    derefLayers,
    normalizePropertyExpression,
    isExpression,
    isZoomExpression,
    diff,
    supportsPropertyExpression,
    convertFunction,
    createExpression,
    isFunction, createFunction,
    createPropertyExpression,
    convertFilter,
    featureFilter,
    typeOf,
    typeToString as toString,
    format,
    validate,
    migrate,
    classifyRings,

    ProjectionDefinitionType,
    ColorType,
    interpolateFactory as interpolates,
    v8,
    NullType,
    styleFunction as function,
    visit,
    expressions,
    expression,
    FormattedType,
};

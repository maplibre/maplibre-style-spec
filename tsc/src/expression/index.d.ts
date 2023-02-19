import ExpressionParsingError from './parsing_error';
import EvaluationContext from './evaluation_context';
import type { EvaluationKind } from './types';
import type { Value } from './values';
import type { Expression } from './expression';
import type { StylePropertySpecification } from '../style-spec';
import type { Result } from '../util/result';
import type { InterpolationType } from './definitions/interpolate';
import type { PropertyValueSpecification } from '../types.g';
import type { FormattedSection } from './types/formatted';
import type Point from '@mapbox/point-geometry';
export type Feature = {
    readonly type: 1 | 2 | 3 | 'Unknown' | 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';
    readonly id?: any;
    readonly properties: {
        [_: string]: any;
    };
    readonly patterns?: {
        [_: string]: {
            'min': string;
            'mid': string;
            'max': string;
        };
    };
    readonly geometry?: Array<Array<Point>>;
};
export type FeatureState = {
    [_: string]: any;
};
export type GlobalProperties = Readonly<{
    zoom: number;
    heatmapDensity?: number;
    lineProgress?: number;
    isSupportedScript?: (_: string) => boolean;
    accumulated?: Value;
}>;
export declare class StyleExpression {
    expression: Expression;
    _evaluator: EvaluationContext;
    _defaultValue: Value;
    _warningHistory: {
        [key: string]: boolean;
    };
    _enumValues: {
        [_: string]: any;
    };
    constructor(expression: Expression, propertySpec?: StylePropertySpecification | null);
    evaluateWithoutErrorHandling(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
    evaluate(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
}
export declare function isExpression(expression: unknown): boolean;
/**
 * Parse and typecheck the given style spec JSON expression.  If
 * options.defaultValue is provided, then the resulting StyleExpression's
 * `evaluate()` method will handle errors by logging a warning (once per
 * message) and returning the default value.  Otherwise, it will throw
 * evaluation errors.
 *
 * @private
 */
export declare function createExpression(expression: unknown, propertySpec?: StylePropertySpecification | null): Result<StyleExpression, Array<ExpressionParsingError>>;
export declare class ZoomConstantExpression<Kind extends EvaluationKind> {
    kind: Kind;
    isStateDependent: boolean;
    _styleExpression: StyleExpression;
    constructor(kind: Kind, expression: StyleExpression);
    evaluateWithoutErrorHandling(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
    evaluate(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
}
export declare class ZoomDependentExpression<Kind extends EvaluationKind> {
    kind: Kind;
    zoomStops: Array<number>;
    isStateDependent: boolean;
    _styleExpression: StyleExpression;
    interpolationType: InterpolationType;
    constructor(kind: Kind, expression: StyleExpression, zoomStops: Array<number>, interpolationType?: InterpolationType);
    evaluateWithoutErrorHandling(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
    evaluate(globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection): any;
    interpolationFactor(input: number, lower: number, upper: number): number;
}
export type ConstantExpression = {
    kind: 'constant';
    readonly evaluate: (globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>) => any;
};
export type SourceExpression = {
    kind: 'source';
    isStateDependent: boolean;
    readonly evaluate: (globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection) => any;
};
export type CameraExpression = {
    kind: 'camera';
    readonly evaluate: (globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>) => any;
    readonly interpolationFactor: (input: number, lower: number, upper: number) => number;
    zoomStops: Array<number>;
    interpolationType: InterpolationType;
};
export type CompositeExpression = {
    kind: 'composite';
    isStateDependent: boolean;
    readonly evaluate: (globals: GlobalProperties, feature?: Feature, featureState?: FeatureState, canonical?: ICanonicalTileID, availableImages?: Array<string>, formattedSection?: FormattedSection) => any;
    readonly interpolationFactor: (input: number, lower: number, upper: number) => number;
    zoomStops: Array<number>;
    interpolationType: InterpolationType;
};
export type StylePropertyExpression = ConstantExpression | SourceExpression | CameraExpression | CompositeExpression;
export declare function createPropertyExpression(expressionInput: unknown, propertySpec: StylePropertySpecification): Result<StylePropertyExpression, Array<ExpressionParsingError>>;
export declare class StylePropertyFunction<T> {
    _parameters: PropertyValueSpecification<T>;
    _specification: StylePropertySpecification;
    kind: EvaluationKind;
    evaluate: (globals: GlobalProperties, feature?: Feature) => any;
    interpolationFactor: ((input: number, lower: number, upper: number) => number);
    zoomStops: Array<number>;
    constructor(parameters: PropertyValueSpecification<T>, specification: StylePropertySpecification);
    static deserialize<T>(serialized: {
        _parameters: PropertyValueSpecification<T>;
        _specification: StylePropertySpecification;
    }): StylePropertyFunction<T>;
    static serialize<T>(input: StylePropertyFunction<T>): {
        _parameters: PropertyValueSpecification<T>;
        _specification: StylePropertySpecification;
    };
}
export declare function normalizePropertyExpression<T>(value: PropertyValueSpecification<T>, specification: StylePropertySpecification): StylePropertyExpression;
import { ICanonicalTileID } from '../tiles_and_coordinates';

import path from 'path';
import fs from 'fs';
import {globSync} from 'glob';
import {
    createPropertyExpression,
    isFunction,
    convertFunction,
    toString,
    ICanonicalTileID,
    StylePropertyExpression,
    StylePropertySpecification,
    ZoomConstantExpression,
    StyleExpression,
    GlobalProperties,
    Feature,
    ZoomDependentExpression
} from '../../../src/index';
import {ExpressionParsingError} from '../../../src/expression/parsing_error';
import {getGeometry} from '../../lib/geometry';
import {deepEqual, stripPrecision} from '../../lib/json-diff';
import {describe, expect, test} from 'vitest';

const DECIMAL_SIGNIFICANT_FIGURES = 6;

type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};

type ExpressionFixture = {
    propertySpec?: Partial<StylePropertySpecification>;
    expression: any[];
    inputs?: FixtureInput[];
    globalState?: Record<string, any>;
    expected?: FixtureResult;
};

type FixtureInput = [
    Partial<GlobalProperties> & {
        availableImages?: string[];
        canonicalID?: {
            z: number;
            x: number;
            y: number;
        };
    },
    {
        properties?: Record<string, any>;
        featureState?: Record<string, any>;
        id?: any;
        geometry?: GeoJSON.Point | GeoJSON.MultiPoint | GeoJSON.LineString | GeoJSON.MultiLineString | GeoJSON.Polygon | GeoJSON.MultiPolygon;
    },
];

type FixtureResult = FixtureErrorResult | FixtureSuccessResult;
type FixtureErrorResult = {
    compiled: CompilationErrorResult;
};
type FixtureSuccessResult = {
    compiled: CompilationSuccessResult;
    outputs: EvaluationOutput[];
};

type CompilationErrorResult = {
    result: 'error';
    errors: {
        key: string;
        error: string;
    }[];
};
type CompilationSuccessResult = {
    result: 'success';
    isFeatureConstant: boolean;
    isZoomConstant: boolean;
    type: string;
};

type EvaluationOutput = EvaluationErrorOutput | EvaluationSuccessOutput;
type EvaluationErrorOutput = {
    error: string;
};
type EvaluationSuccessOutput = any;

const expressionTestFileNames = globSync('**/test.json', {cwd: __dirname});
describe('expression', () => {

    for (const expressionTestFileName of expressionTestFileNames) {
        test(expressionTestFileName, () => {

            const fixturePath = path.join(__dirname, expressionTestFileName);
            const fixture: ExpressionFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

            const spec = getCompletePropertySpec(fixture.propertySpec);
            const result = evaluateFixture(fixture, spec);

            if (process.env.UPDATE) {
                fixture.expected = isFixtureErrorResult(result) ?
                    result :
                    {
                        compiled: result.compiled,
                        outputs: stripPrecision(result.outputs, DECIMAL_SIGNIFICANT_FIGURES),
                    };
                if (fixture.propertySpec) {
                    fixture.propertySpec = spec;
                }

                fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));
                return;
            }

            const expected = fixture.expected as FixtureResult;

            const compileOk = deepEqual(result.compiled, expected.compiled, DECIMAL_SIGNIFICANT_FIGURES);
            try {
                expect(compileOk).toBeTruthy();
            } catch {
                throw new Error(`Compilation Failed:\nExpected ${JSON.stringify(expected.compiled)}\nResult   ${JSON.stringify(result.compiled)}`);
            }

            const resultOutputs = (result as any).outputs;
            const expectedOutputs = (expected as any).outputs;
            const evalOk = compileOk && deepEqual(resultOutputs, expectedOutputs, DECIMAL_SIGNIFICANT_FIGURES);
            try {
                expect(evalOk).toBeTruthy();
            } catch {
                throw new Error(`Evaluation Failed:\nExpected ${JSON.stringify(expectedOutputs)}\nResult   ${JSON.stringify(resultOutputs)}`);
            }

        });
    }
});

function getCompletePropertySpec(propertySpec: ExpressionFixture['propertySpec']) {
    const spec = propertySpec === undefined ? {} : {...propertySpec};
    if (!spec['property-type']) {
        spec['property-type'] = 'data-driven';
    }
    if (!spec['expression']) {
        spec['expression'] = {
            'interpolated': true,
            'parameters': ['zoom', 'feature'],
        };
    }
    return spec as StylePropertySpecification;
}

function evaluateFixture(fixture: ExpressionFixture, spec: StylePropertySpecification): FixtureResult {
    const expression = isFunction(fixture.expression) ?
        createPropertyExpression(convertFunction(fixture.expression, spec), spec, fixture.globalState) :
        createPropertyExpression(fixture.expression, spec, fixture.globalState);

    if (expression.result === 'error') {
        return {
            compiled: getCompilationErrorResult(expression.value),
        };
    }
    return {
        compiled: getCompilationSuccessResult(expression.value),
        outputs: fixture.inputs === undefined ? [] : evaluateExpression(fixture.inputs, expression.value),
    };
}

function getCompilationErrorResult(parsingErrors: ExpressionParsingError[]): CompilationErrorResult {
    return {
        result: 'error',
        errors: parsingErrors.map((err) => ({
            key: err.key,
            error: err.message,
        })),
    };
}

function getCompilationSuccessResult(expression: StylePropertyExpression): CompilationSuccessResult {
    const kind = expression.kind;
    const type = getStylePropertyExpressionType(expression);
    return {
        result: 'success',
        isFeatureConstant: kind === 'constant' || kind ==='camera',
        isZoomConstant: kind === 'constant' || kind === 'source',
        type: toString(type),
    };
}

function evaluateExpression(inputs: FixtureInput[], expression: StylePropertyExpression): EvaluationOutput[] {
    const type = getStylePropertyExpressionType(expression);
    const outputs: EvaluationOutput[] = [];

    for (const input of inputs) {
        const {availableImages, canonicalID} = input[0];
        const {featureState, geometry, id, properties} = input[1];

        const canonical = (canonicalID ?? null) as ICanonicalTileID | null;
        const feature: Partial<Mutable<Feature>> = {
            properties: properties ?? {},
        };
        if (id !== undefined) {
            feature.id = id;
        }
        if (geometry !== undefined) {
            if (canonical !== null) {
                getGeometry(feature, geometry, canonical);
            } else {
                feature.type = geometry.type;
            }
        }

        try {
            let value = (expression as ZoomConstantExpression<any> | ZoomDependentExpression<any>).evaluateWithoutErrorHandling(
                input[0] as GlobalProperties,
                feature as Feature,
                featureState ?? {},
                canonical as ICanonicalTileID,
                availableImages ?? [],
            );
            if (type.kind === 'color') {
                value = [value.r, value.g, value.b, value.a];
            }
            outputs.push(value);
        } catch (error) {
            outputs.push({
                error: error.name === 'ExpressionEvaluationError' ?
                    error.toJSON() :
                    error.message,
            });
        }
    }
    return outputs;
}

function getStylePropertyExpressionType(expression: StylePropertyExpression) {
    return ((expression as any)._styleExpression as StyleExpression).expression.type;
}

function isFixtureErrorResult(fixtureResult: FixtureResult): fixtureResult is FixtureErrorResult {
    return fixtureResult.compiled.result === 'error';
}

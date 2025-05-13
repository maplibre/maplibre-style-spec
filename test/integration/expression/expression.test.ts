import path from 'path';
import fs from 'fs';
import {globSync} from 'glob';
import {
    createPropertyExpression,
    isFunction,
    convertFunction,
    toString,
    ICanonicalTileID,
    StylePropertyExpression
} from '../../../src/index';
import {ExpressionParsingError} from '../../../src/expression/parsing_error';
import {Result} from '../../../src/util/result';
import {getGeometry} from '../../lib/geometry';
import {deepEqual, stripPrecision} from '../../lib/json-diff';

const DECIMAL_SIGNIFICANT_FIGURES =  6;

type ExpressionFixture = {
    propertySpec: any;
    expression: any[];
    inputs:any[];
    expected: {
        compiled?: {
            result?: any;
            isFeatureConstant?: any;
            isZoomConstant?: any;
            type?: any;
        };
        outputs? : any;
        serialized?: any;
    };
}

const expressionTestFileNames = globSync('**/test.json', {cwd: __dirname});
describe('expression', () => {

    for (const expressionTestFileName of expressionTestFileNames) {
        test(expressionTestFileName, () => {

            const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, expressionTestFileName), 'utf8'));

            const result = evaluateFixture(fixture);

            if (process.env.UPDATE) {
                fixture.expected = {
                    compiled: result.compiled,
                    outputs: stripPrecision(result.outputs, DECIMAL_SIGNIFICANT_FIGURES),
                };

                delete fixture.metadata;

                const fname = path.join(__dirname, expressionTestFileName);
                fs.writeFileSync(fname, JSON.stringify(fixture, null, 2));
                return;
            }

            const expected = fixture.expected;
            const compileOk = deepEqual(result.compiled, expected.compiled, DECIMAL_SIGNIFICANT_FIGURES);
            
            const evalOk = compileOk && deepEqual(result.outputs, expected.outputs, DECIMAL_SIGNIFICANT_FIGURES);
            
            try {
                expect(compileOk).toBeTruthy();
            } catch {
                throw new Error(`Compilation Failed:\nExpected ${JSON.stringify(expected.compiled)}\nResult   ${JSON.stringify(result.compiled)}`);
            }
            
            try {
                expect(evalOk).toBeTruthy();
            } catch {
                throw new Error(`Evaluation Failed:\nExpected ${JSON.stringify(expected.outputs)}\nResult   ${JSON.stringify(result.outputs)}`);
            }

        });
    }
});

function evaluateFixture(fixture: ExpressionFixture) {
    const spec = fixture.propertySpec || {};

    if (!spec['property-type']) {
        spec['property-type'] = 'data-driven';
    }

    if (!spec['expression']) {
        spec['expression'] = {
            'interpolated': true,
            'parameters': ['zoom', 'feature']
        };
    }

    const expression = isFunction(fixture.expression) ?
        createPropertyExpression(convertFunction(fixture.expression, spec), spec) :
        createPropertyExpression(fixture.expression, spec);

    const result: { compiled: any; outputs?: any } = {
        compiled: getCompilationResult(expression)
    };

    if (result.compiled.result !== 'error') {
        result.outputs = evaluateExpression(fixture, expression);
    }

    return result;
}

function getCompilationResult(expression: Result<StylePropertyExpression, ExpressionParsingError[]>) {
    const compilationResult = {} as any;
    if (expression.result === 'error') {
        compilationResult.result = 'error';
        compilationResult.errors = expression.value.map((err) => ({
            key: err.key,
            error: err.message
        }));
        return compilationResult;
    }

    const expressionValue = expression.value;
    const type = (expressionValue as any)._styleExpression.expression.type; // :scream:

    compilationResult.result = 'success';
    compilationResult.isFeatureConstant = expressionValue.kind === 'constant' || expressionValue.kind === 'camera';
    compilationResult.isZoomConstant = expressionValue.kind === 'constant' || expressionValue.kind === 'source';
    compilationResult.type = toString(type);

    return compilationResult;
}

function evaluateExpression(fixture: ExpressionFixture, expression: Result<StylePropertyExpression, ExpressionParsingError[]>) {

    let availableImages: any[];
    let canonical: ICanonicalTileID | null;

    const evaluationResult: any[] = [];

    const expressionValue = expression.value;
    const type = (expressionValue as any)._styleExpression.expression.type; // :scream:

    for (const input of fixture.inputs || []) {
        try {
            const feature: {
                properties: any;
                id?: any;
                type?: any;
            } = {properties: input[1].properties || {}};
            const featureState = input[1].featureState ?? {};
            availableImages = input[0].availableImages || [];
            if ('canonicalID' in input[0]) {
                const id = input[0].canonicalID;
                canonical = {z: id.z, x: id.x, y: id.y} as any;
            } else {
                canonical = null;
            }

            if ('id' in input[1]) {
                feature.id = input[1].id;
            }
            if ('geometry' in input[1]) {
                if (canonical !== null) {
                    getGeometry(feature, input[1].geometry, canonical);
                } else {
                    feature.type = input[1].geometry.type;
                }
            }

            let value = expressionValue.evaluateWithoutErrorHandling(input[0], feature, featureState, canonical, availableImages);
            
            if (type.kind === 'color') {
                value = [value.r, value.g, value.b, value.a];
            }
            evaluationResult.push(value);
        } catch (error) {
            if (error.name === 'ExpressionEvaluationError') {
                evaluationResult.push({error: error.toJSON()});
            } else {
                evaluationResult.push({error: error.message});
            }
        }
    }

    if (fixture.inputs) {
        return evaluationResult;
    }
}

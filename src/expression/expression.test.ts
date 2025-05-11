import {createPropertyExpression, Feature, GlobalProperties, StylePropertyExpression} from '../expression';
import {expressions} from './definitions';
import v8 from '../reference/v8.json' with {type: 'json'};
import {Color, createExpression as _createExpression, ICanonicalTileID, StyleExpression, StylePropertySpecification} from '..';
import {ExpressionParsingError} from './parsing_error';
import {getGeometry} from '../../test/lib/geometry';
import {VariableAnchorOffsetCollection} from './types/variable_anchor_offset_collection';
import {expectToMatchColor} from '../../test/lib/util';
import {ExpressionSpecification} from '../types.g';

// createExpression with a type-checked expression parameter
function createExpression(expression: ExpressionSpecification, propertySpec?: StylePropertySpecification | null) {
    return _createExpression(expression, propertySpec);
}

// filter out internal "error" and "filter-*" expressions from definition list
const filterExpressionRegex = /filter-/;
const definitionList = Object.keys(expressions).filter((expression) => {
    return expression !== 'error' && !filterExpressionRegex.exec(expression);
}).sort();

describe('v8.json includes all definitions from style-spec', () => {
    const v8List = Object.keys(v8.expression_name.values);
    const v8SupportedList = v8List.filter((expression) => {
        //filter out expressions that are not supported in GL-JS
        return !!v8.expression_name.values[expression]['sdk-support']['basic functionality']['js'];
    });
    expect(definitionList).toEqual(v8SupportedList.sort());
});

describe('createPropertyExpression', () => {
    test('prohibits non-interpolable properties from using an "interpolate" expression', () => {
        const {result, value} = createPropertyExpression([
            'interpolate', ['linear'], ['zoom'], 0, 0, 10, 10
        ], {
            type: 'number',
            'property-type': 'data-constant',
            expression: {
                'interpolated': false,
                'parameters': ['zoom']
            }
        } as StylePropertySpecification);
        expect(result).toBe('error');
        expect((value as ExpressionParsingError[])).toHaveLength(1);
        expect(value[0].message).toBe('"interpolate" expressions cannot be used with this property');
    });
});

describe('evaluate expression', () => {
    test('warns and falls back to default for invalid enum values', () => {
        const {value} = createPropertyExpression(['get', 'x'], {
            type: 'enum',
            values: {a: {}, b: {}, c: {}},
            default: 'a',
            'property-type': 'data-driven',
            expression: {
                'interpolated': false,
                'parameters': ['zoom', 'feature']
            }
        } as any as StylePropertySpecification) as {value: StylePropertyExpression};

        jest.spyOn(console, 'warn').mockImplementation(() => { });

        expect(value.kind).toBe('source');

        expect(value.evaluate({} as GlobalProperties, {properties: {x: 'b'}} as any as Feature)).toBe('b');
        expect(value.evaluate({} as GlobalProperties, {properties: {x: 'invalid'}} as any as Feature)).toBe('a');
        expect(console.warn).toHaveBeenCalledWith('Expected value to be one of "a", "b", "c", but found "invalid" instead.');
    });

    test('warns for invalid variableAnchorOffsetCollection values', () => {
        const {value} = createPropertyExpression(['get', 'x'], {
            type: 'variableAnchorOffsetCollection',
            'property-type': 'data-driven',
            transition: false,
            expression: {
                'interpolated': false,
                'parameters': ['zoom', 'feature']
            }
        }) as {value: StylePropertyExpression};

        const warnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.kind).toBe('source');

        expect(value.evaluate({} as GlobalProperties, {properties: {x: 'invalid'}} as any as Feature)).toBeNull();
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith('Could not parse variableAnchorOffsetCollection from value \'invalid\'');

        warnMock.mockClear();
        expect(value.evaluate({} as GlobalProperties, {properties: {x: ['top', [2, 2]]}} as any as Feature)).toEqual(new VariableAnchorOffsetCollection(['top', [2, 2]]));
        expect(console.warn).not.toHaveBeenCalled();
    });
});

describe('Distance expression', () => {
    describe('Invalid expression', () => {
        test('missing geometry', () => {
            // @ts-expect-error
            const response = createExpression(['distance']);
            expect(response.result).toBe('error');
        });
        test('invalid geometry', () => {
            // @ts-expect-error
            const response = createExpression(['distance', {type: 'Nope!'}]);
            expect(response.result).toBe('error');
        });
        test('expression as geometry', () => {
            // @ts-expect-error
            const response = createExpression(['distance', ['literal', {type: 'MultiPoint', coordinates: [[3, 3], [3, 4]]}]]);
            expect(response.result).toBe('error');
        });
    });

    describe('valid expression', () => {
        test('multi point geometry', () => {
            const response = createExpression(['distance', {type: 'MultiPoint', coordinates: [[3, 3], [3, 4]]}]);
            expect(response.result).toBe('success');
        });
        test('multi line geometry', () => {
            const response = createExpression(['distance', {type: 'MultiLineString', coordinates: [[[3, 3], [3, 4]]]}]);
            expect(response.result).toBe('success');
        });
        test('multi polygon geometry', () => {
            const response = createExpression(['distance', {type: 'MultiPolygon', coordinates: [[[[3, 3], [3, 4], [4, 4], [4, 3], [3, 3]]]]}]);
            expect(response.result).toBe('success');
        });
    });

    describe('Distance from point', () => {
        const featureInTile = {} as Feature;
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        let value: StyleExpression;

        beforeEach(() => {
            const response = createExpression(
                ['distance', {type: 'Point', coordinates: [3, 3]}],
                {
                    type: 'number',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: false,
                        parameters: ['zoom']
                    }
                } as StylePropertySpecification);
            value = response.value as StyleExpression;
        });
        test('point to point in the same location', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('point to point in different location', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3.001]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('point to line', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3.001, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
        test('point to line that passes through the point', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[2, 3], [4, 3]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('point to line that pass through the point vertically', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[3, 2], [3, 4]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('point to containing polygon', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('point to near by polygon', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 2.999], [3, 2.999], [3, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('point to polygon with hole around the point', () => {
            // polygon inner ring direction is important!
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]], [[2.999, 2.999], [3.001, 2.999], [3.001, 3.001], [2.999, 3.001], [2.999, 2.999]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
    });
    describe('Distance from line', () => {
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        let value: StyleExpression;

        beforeEach(() => {
            const response = createExpression(
                ['distance', {type: 'LineString', coordinates: [[3, 3], [3, 4]]}],
                {
                    type: 'number',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: false,
                        parameters: ['zoom']
                    }
                } as StylePropertySpecification);

            value = response.value as StyleExpression;
        });
        test('line to point that is on the line', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('line to point that is on the middle of the line', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3.5]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('line to point that is close by horizontally', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 2.999]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('line to point that is close by vertically', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3.001, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
        test('line to line that are parallel', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[3.001, 3], [3.001, 4]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
        test('line to line that are perpendicular', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[2.5, 3.5], [3.5, 3.5]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('line to polygon that contains the line', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('line to polygon that is close by', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 2.999], [3, 2.999], [3, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('line to polygon with hole around the line', () => {
            // polygon inner ring direction is important!
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]], [[2.999, 2.999], [3.001, 2.999], [3.001, 4.001], [2.999, 4.001], [2.999, 2.999]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
    });
    describe('Distance from long line', () => {
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        let value: StyleExpression;

        beforeEach(() => {
            const coordinates = [];
            for (let i = 0; i < 200; i++) {
                coordinates.push([3, 3 + i / 200.0]);
            }
            const response = createExpression(
                ['distance', {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: {
                            type: 'LineString', coordinates
                        },
                        properties: {},
                    }]
                }],
                {
                    type: 'number',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: false,
                        parameters: ['zoom']
                    }
                } as StylePropertySpecification);

            value = response.value as StyleExpression;
        });
        test('long line to multiple points close by', () => {
            const coordinates = [];
            for (let i = 0; i < 200; i++) {
                coordinates.push([2.999, 3 + i / 200.0]);
            }
            getGeometry(featureInTile, {type: 'MultiPoint', coordinates}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
    });

    describe('Distance from simple polygon', () => {
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        let value: StyleExpression;
        let response: any;

        beforeEach(() => {
            response = createExpression(
                ['distance', {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[3, 3], [3, 4], [4, 4], [4, 3], [3, 3]]]
                    },
                    properties: {},
                }],
                {
                    type: 'number',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: false,
                        parameters: ['zoom']
                    }
                } as StylePropertySpecification);
            value = response.value as StyleExpression;
        });

        test('polygon to point that is on the edge of the the polygon', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        });
        test('polygon to point that is inside the polygon', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3.001, 3.001]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('polygon to point that is outside the polygon', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [2.999, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
        test('polygon to multiple points outside the polygon that require a better algorithm', () => {
            const coordinates = [];
            for (let i = 0; i < 200; i++) {
                coordinates.push([2.999, 3 - i / 1000.0]);
            }
            getGeometry(featureInTile, {type: 'MultiPoint', coordinates}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });

        test('polygon to multiple points outside and inside the polygon that require a better algorithm', () => {
            const coordinates = [];
            for (let i = 0; i < 200; i++) {
                coordinates.push([2.999, 3 - i / 1000.0]);
            }
            coordinates.push([3.001, 3.001]);
            getGeometry(featureInTile, {type: 'MultiPoint', coordinates}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });

        test('polygon to line that is outside the polygon', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[2.999, 3], [2.999, 4]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        });
        test('polygon to line that is passes through the polygon', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[2.5, 3.5], [3.5, 3.5]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('polygon to polygon that is inside the polygon', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('polygon to polygon that is outside the polygon', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 2.999], [3, 2.999], [3, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('polygon to polygon that contains the polygon', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[3.5, 3.5], [3.5, 3.6], [3.6, 3.6], [3.6, 3.5], [3.5, 3.5]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('polygon to polygon with hole around the polygon', () => {
            // polygon with hole - direction is important!
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]], [[2.999, 2.999], [4.001, 2.999,], [4.001, 4.001], [2.999, 4.001], [2.999, 2.999]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
    });
    describe('Distance from polygon with hole', () => {
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        let value: StyleExpression;

        beforeEach(() => {
            const response = createExpression(
                ['distance', {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]], [[2.999, 2.999], [2.999, 4.001], [4.001, 4.001], [4.001, 2.999], [2.999, 2.999]]]}],
                {
                    type: 'number',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: false,
                        parameters: ['zoom']
                    }
                } as StylePropertySpecification);
            value = response.value as StyleExpression;
        });

        test('polygon to point inside the hole', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('polygon to point inside the polygon', () => {
            getGeometry(featureInTile, {type: 'Point', coordinates: [2.999, 2.999]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0);
        });
        test('polygon to line inside the hole', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[3, 3], [3, 4]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        });
        test('polygon to line inside the polygon', () => {
            getGeometry(featureInTile, {type: 'LineString', coordinates: [[2.5, 3.5], [3.5, 3.5]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
        test('polygon to polygon containing the polygon with the hole', () => {
            getGeometry(featureInTile, {type: 'Polygon', coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]]}, canonical);
            expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
        });
    });
});

describe('"array" expression', () => {
    test('requires an expression as the input value', () => {
        const invalidResponses = [
            // @ts-expect-error
            createExpression(['array', 1, 2, 3]),
            // @ts-expect-error
            createExpression(['array', [1, 2, 3]]),
            // @ts-expect-error
            createExpression(['array', 'number', [1, 2, 3]]),
            // @ts-expect-error
            createExpression(['array', 'number', 3, [1, 2, 3]]),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
        const validResponses = [
            createExpression(['array', ['literal', []]]),
            createExpression(['array', 'number', ['literal', [1, 2, 3]]]),
            createExpression(['array', 'number', Number.MAX_SAFE_INTEGER, ['get', 'arr']]),
        ];
        for (const response of validResponses) {
            expect(response.result).toBe('success');
        }
    });
    test('requires either "string", "number", or "boolean" as the asserted type', () => {
        const invalidResponses = [
            // @ts-expect-error
            createExpression(['array', 0, ['literal', []]]),
            // @ts-expect-error
            createExpression(['array', '0', ['literal', []]]),
            // @ts-expect-error
            createExpression(['array', ['literal', 'number'], ['literal', []]]),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
        const validResponses = [
            createExpression(['array', 'string', ['literal', []]]),
            createExpression(['array', 'number', ['literal', []]]),
            createExpression(['array', 'boolean', ['literal', []]]),
        ];
        for (const response of validResponses) {
            expect(response.result).toBe('success');
        }
    });
    test('requires a non-negative integer literal as the asserted length', () => {
        const invalidResponses = [
            // @ts-expect-error
            createExpression(['array', 'string', '0', ['literal', []]]),
            // @ts-expect-error
            createExpression(['array', 'string', ['literal', 0], ['literal', []]]),
            createExpression(['array', 'string', -1, ['literal', []]]),
            createExpression(['array', 'string', 0.5, ['literal', []]]),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
        const validResponses = [
            createExpression(['array', 'string', 0, ['literal', []]]),
            createExpression(['array', 'string', 2, ['literal', ['one', 'two']]]),
        ];
        for (const response of validResponses) {
            expect(response.result).toBe('success');
        }
    });
});

describe('"format" expression', () => {
    test('rejects bare string arrays in the "text-font" style override', () => {
        // @ts-expect-error
        const response = createExpression(['format', 'foo', {'text-font': ['Helvetica', 'Arial']}]);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "format" expression');
        }
        expect(response.value[0].message).toContain('Unknown expression \"Helvetica\".');
    });
    test('requires either "bottom", "center", or "top" as the vertical alignment', () => {
        // @ts-expect-error
        const response = createExpression(['format', 'foo', {'vertical-align': 'middle'}]);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "format" expression');
        }
        expect(response.value[0].message).toBe('\'vertical-align\' must be one of: \'bottom\', \'center\', \'top\' but found \'middle\' instead.');
    });
    test('aligns a text section vertically', () => {
        const response = createExpression(['format', 'foo', {'vertical-align': 'top'}]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "format" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toMatchObject({
            sections: [
                {
                    text: 'foo',
                    verticalAlign: 'top',
                },
            ],
        });
    });
    test('aligns an image vertically', () => {
        const response = createExpression(['format', ['image', 'bar'], {'vertical-align': 'bottom'}]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "format" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toMatchObject({
            sections: [
                {
                    image: {available: false, name: 'bar'},
                    verticalAlign: 'bottom',
                },
            ],
        });
    });
    test('applies default styles with an empty overrides object', () => {
        const response = createExpression(['format', ['downcase', 'BaR'], {}]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "format" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toEqual({
            sections: [
                {
                    fontStack: null,
                    image: null,
                    scale: null,
                    text: 'bar',
                    textColor: null,
                    verticalAlign: null,
                },
            ],
        });
    });
});

describe('"image" expression', () => {
    test('requires a string as the image name argument', () => {
        const invalidResponses = [
            createExpression(['image', null]),
            // @ts-expect-error
            createExpression(['image', true]),
            // @ts-expect-error
            createExpression(['image', 123]),
            createExpression(['image', ['+', 1, 4]]),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
    });
    test('returns an image with a string literal as the image name', () => {
        const response = createExpression(['image', 'foo']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "image" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toMatchObject({
            available: false,
            name: 'foo',
        });
    });
    test('returns an image with an expression as the image name', () => {
        const response = createExpression(['image', ['concat', 'foo', 'bar']]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "image" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toMatchObject({
            available: false,
            name: 'foobar',
        });
    });
});

describe('"typeof" expression', () => {
    test('requires a value argument', () => {
        // @ts-expect-error
        const response = createExpression(['typeof']);
        expect(response.result).toBe('error');
    });
    test('rejects a second argument', () => {
        // @ts-expect-error
        const response = createExpression(['typeof', true, 42]);
        expect(response.result).toBe('error');
    });
    test('returns a string describing the type of the given literal value', () => {
        const response = createExpression(['typeof', true]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "typeof" expression');
        }
        expect(response.value.evaluate({zoom: 5})).toBe('boolean');
    });
    test('returns a string describing the type of the given expression value', () => {
        const response = createExpression(['typeof', ['concat', 'foo', ['to-string', 0]]]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "typeof" expression');
        }
        expect(response.value.evaluate({zoom: 5})).toBe('string');
    });
});

describe('"feature-state" expression', () => {
    test('retrieves the feature state with a string literal argument', () => {
        const response = createExpression(['feature-state', 'foo']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "feature-state" expression');
        }
        expect(response.value.evaluate({zoom: 5}, undefined, {foo: 'foo value'})).toBe('foo value');
    });
    test('retrieves the feature state with an expression argument', () => {
        const response = createExpression(['feature-state', ['get', 'feat-prop']]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "feature-state" expression');
        }
        expect(response.value.evaluate(
            {zoom: 5},
            {type: 'Point', properties: {'feat-prop': 'state-prop'}},
            {'state-prop': 'state-prop value'},
        )).toBe('state-prop value');
    });
});

describe('"get" expression', () => {
    test('requires an expression as the object argument if provided', () => {
        // @ts-expect-error
        const response = createExpression(['get', 'prop', {prop: 4}]);
        expect(response.result).toBe('error');
    });
    test('retrieves a property value from the given object argument', () => {
        const response = createExpression(['get', 'prop', ['literal', {prop: 4}]]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "get" expression');
        }
        expect(response.value.evaluate({zoom: 20})).toBe(4);
    });
});

describe('"global-state" expression', () => {
    test('requires a property argument', () => {
        // @ts-expect-error
        const response = createExpression(['global-state']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "global-state" expression');
        }
        expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
        expect(response.value[0].message).toBe('Expected 1 argument, but found 0 instead.');
    });
    test('requires a string literal as the property argument', () => {
        // @ts-expect-error
        const response = createExpression(['global-state', ['concat', 'pr', 'op']]);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "global-state" expression');
        }
        expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
        expect(response.value[0].message).toBe('Global state property must be string, but found object instead.');
    });
    test('rejects a second argument', () => {
        // @ts-expect-error
        const response = createExpression(['global-state', 'foo', 'bar']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "global-state" expression');
        }
        expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
        expect(response.value[0].message).toBe('Expected 1 argument, but found 2 instead.');
    });
    test('returns null if no value nor default value set for given property', () => {
        const response = createExpression(['global-state', 'foo']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "global-state" expression');
        }
        expect(response.value.evaluate({globalState: {baz: 'bar'}, zoom: 0})).toBeNull();
    });
    test('evaluates a global state property', () => {
        const response = createExpression(['global-state', 'foo']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "global-state" expression');
        }
        expect(response.value.evaluate({globalState: {foo: 'bar'}, zoom: 0})).toBe('bar');
    });
});

describe('"has" expression', () => {
    test('requires an expression as the object argument if provided', () => {
        // @ts-expect-error
        const response = createExpression(['has', 'prop', {prop: 4}]);
        expect(response.result).toBe('error');
    });
    test('checks whether a property exists in the given object argument', () => {
        const response = createExpression(['has', 'prop', ['literal', {prop: 4}]]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "has" expression');
        }
        expect(response.value.evaluate({zoom: 20})).toBe(true);
    });
});

describe('"in" expression', () => {
    test('requires a needle', () => {
        // @ts-expect-error
        const response = createExpression(['in']);
        expect(response.result).toBe('error');
    });
    test('requires a haystack', () => {
        // @ts-expect-error
        const response = createExpression(['in', 'a']);
        expect(response.result).toBe('error');
    });
    test('rejects a third argument', () => {
        // @ts-expect-error
        const response = createExpression(['in', 'a', 'abc', 1]);
        expect(response.result).toBe('error');
    });
    test('requires a primitive as the needle', () => {
        const response = createExpression(['in', ['literal', ['a']], ['literal', [['a'], ['b'], ['c']]]]);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the haystack', () => {
        // @ts-expect-error
        const response = createExpression(['in', 't', true]);
        expect(response.result).toBe('error');
    });
    test('cannot find an empty substring in an empty string', () => {
        const response = createExpression(['in', '', '']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(false);
    });
    test('finds an empty substring in a non-empty string', () => {
        const response = createExpression(['in', '', 'abc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(true);
    });
    test('cannot find a non-empty substring in an empty string', () => {
        const response = createExpression(['in', 'abc', '']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(false);
    });
    test('finds a non-empty substring in a non-empty string', () => {
        const response = createExpression(['in', 'b', 'abc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(true);
    });
    test('finds a non-literal substring in a string', () => {
        const response = createExpression(['in', ['downcase', 'C'], ['concat', 'ab', 'cd']]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(true);
    });
    test('cannot find an element in an empty array', () => {
        const response = createExpression(['in', 1, ['literal', []]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(false);
    });
    test('finds an element in a non-empty array', () => {
        const response = createExpression(['in', 2, ['literal', [1, 2, 3]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(true);
    });
    test('finds null in an array containing null', () => {
        const response = createExpression(['in', null, ['get', 'arr']]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate(
            {zoom: 20},
            {type: 'Point', properties: {arr: [42, null, 256]}},
        )).toBe(true);
    });
    test('finds a non-literal element in an array', () => {
        const response = createExpression(['in', ['*', 2, 5], ['literal', [1, 10, 100]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(true);
    });
});

describe('"index-of" expression', () => {
    test('requires a needle', () => {
        // @ts-expect-error
        const response = createExpression(['index-of']);
        expect(response.result).toBe('error');
    });
    test('requires a haystack', () => {
        // @ts-expect-error
        const response = createExpression(['index-of', 'a']);
        expect(response.result).toBe('error');
    });
    test('rejects a fourth argument', () => {
        // @ts-expect-error
        const response = createExpression(['index-of', 'a', 'abc', 1, 8]);
        expect(response.result).toBe('error');
    });
    test('requires a primitive as the needle', () => {
        const response = createExpression(['index-of', ['literal', ['a']], ['literal', [['a'], ['b'], ['c']]]]);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the haystack', () => {
        // @ts-expect-error
        const response = createExpression(['index-of', 't', true]);
        expect(response.result).toBe('error');
    });
    test('finds an empty substring in an empty string', () => {
        const response = createExpression(['index-of', '', '']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(0);
    });
    test('finds an empty substring in a non-empty string', () => {
        const response = createExpression(['index-of', '', 'abc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(0);
    });
    test('cannot find a non-empty substring in an empty string', () => {
        const response = createExpression(['index-of', 'abc', '']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(-1);
    });
    test('finds a non-empty substring in a non-empty string', () => {
        const response = createExpression(['index-of', 'b', 'abc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('finds a non-literal substring in a string', () => {
        const response = createExpression(['index-of', ['downcase', 'C'], ['concat', 'ab', 'cd']]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('only finds the first occurrence in a string', () => {
        const response = createExpression(['index-of', 'b', 'abbc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('starts looking for the substring at a positive start index', () => {
        const response = createExpression(['index-of', 'a', 'abc', 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(-1);
    });
    test('starts looking for the substring at a negative start index', () => {
        const response = createExpression(['index-of', 'c', 'abc', -1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('starts looking for the substring at a non-literal start index', () => {
        const response = createExpression(['index-of', 'c', 'abc', ['-', 0, 1]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('counts a non-ASCII character as a single character', () => {
        const response = createExpression(['index-of', '镇', '市镇']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('counts a surrogate pair as a single character', () => {
        const response = createExpression(['index-of', '市镇', '丐𦨭市镇']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('cannot find an element in an empty array', () => {
        const response = createExpression(['index-of', 1, ['literal', []]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(-1);
    });
    test('finds an element in a non-empty array', () => {
        const response = createExpression(['index-of', 2, ['literal', [1, 2, 3]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('finds null in an array containing null', () => {
        const response = createExpression(['index-of', null, ['get', 'arr']]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate(
            {zoom: 20},
            {type: 'Point', properties: {arr: [42, null, 256]}},
        )).toBe(1);
    });
    test('finds a non-literal element in an array', () => {
        const response = createExpression(['index-of', ['*', 2, 5], ['literal', [1, 10, 100]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('only finds the first occurrence in an array', () => {
        const response = createExpression(['index-of', 2, ['literal', [1, 2, 2, 3]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
    test('starts looking for the element at a positive start index', () => {
        const response = createExpression(['index-of', 1, ['literal', [1, 2, 3]], 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(-1);
    });
    test('starts looking for the element at a negative start index', () => {
        const response = createExpression(['index-of', 3, ['literal', [1, 2, 3]], -1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('starts looking for the element at a non-literal start index', () => {
        const response = createExpression(['index-of', 2, ['literal', [1, 2, 3]], ['+', 0, -1, 2]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(1);
    });
});

describe('"length" expression', () => {
    test('requires an argument', () => {
        // @ts-expect-error
        const response = createExpression(['length']);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the argument', () => {
        // @ts-expect-error
        const response = createExpression(['length', true]);
        expect(response.result).toBe('error');
    });
    test('rejects a second argument', () => {
        // @ts-expect-error
        const response = createExpression(['length', 'abc', 'def']);
        expect(response.result).toBe('error');
    });
    test('measures an empty string', () => {
        const response = createExpression(['length', '']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(0);
    });
    test('measures a non-empty string', () => {
        const response = createExpression(['length', 'abc']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(3);
    });
    test('counts a non-ASCII character as a single character', () => {
        const response = createExpression(['length', '市镇']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(2);
    });
    test('counts a surrogate pair as a single character', () => {
        const response = createExpression(['length', '丐𦨭市镇']);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(4);
    });
    test('measures an empty array', () => {
        const response = createExpression(['length', ['literal', []]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(0);
    });
    test('measures a non-empty array', () => {
        const response = createExpression(['length', ['literal', [1, 2, 3]]]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe(3);
    });
});

describe('"slice" expression', () => {
    test('requires an input argument', () => {
        // @ts-expect-error
        const response = createExpression(['slice']);
        expect(response.result).toBe('error');
    });
    test('requires a start index argument', () => {
        // @ts-expect-error
        const response = createExpression(['slice', 'abc']);
        expect(response.result).toBe('error');
    });
    test('rejects a fourth argument', () => {
        // @ts-expect-error
        const response = createExpression(['slice', 'abc', 0, 1, 8]);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the input argument', () => {
        // @ts-expect-error
        const response = createExpression(['slice', true, 0]);
        expect(response.result).toBe('error');
    });
    test('requires a number as the start index argument', () => {
        // @ts-expect-error
        const response = createExpression(['slice', 'abc', true]);
        expect(response.result).toBe('error');
    });
    test('slices an empty string', () => {
        const response = createExpression(['slice', '', 0]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('');
    });
    test('slices a string starting at the beginning', () => {
        const response = createExpression(['slice', 'abc', 0]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('abc');
    });
    test('slices a string starting at the middle', () => {
        const response = createExpression(['slice', 'abc', 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('bc');
    });
    test('slices a string starting at the end', () => {
        const response = createExpression(['slice', 'abc', 3]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('');
    });
    test('slices a string backwards from the end', () => {
        const response = createExpression(['slice', 'abc', -2]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('bc');
    });
    test('slices a string by a zero-length range', () => {
        const response = createExpression(['slice', 'abc', 1, 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('');
    });
    test('slices a string by a negative-length range', () => {
        const response = createExpression(['slice', 'abc', 2, 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('');
    });
    test('avoids splitting a non-ASCII character', () => {
        const response = createExpression(['slice', '市镇', 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('镇');
    });
    test('avoids splitting a surrogate pair', () => {
        const response = createExpression(['slice', '丐𦨭市镇', 2]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toBe('市镇');
    });
    test('slices an empty array', () => {
        const response = createExpression(['slice', ['literal', []], 0]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([]);
    });
    test('slices an array starting at the beginning', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], 0]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([1, 2, 3]);
    });
    test('slices an array starting at the middle', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([2, 3]);
    });
    test('slices an array starting at the end', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], 3]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([]);
    });
    test('slices an array backwards from the end', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], -2]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([2, 3]);
    });
    test('slices an array by a zero-length range', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], 1, 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([]);
    });
    test('slices an array by a negative-length range', () => {
        const response = createExpression(['slice', ['literal', [1, 2, 3]], 2, 1]);
        expect(response.result).toBe('success');
        expect((response.value as StyleExpression)?.evaluate({zoom: 20})).toEqual([]);
    });
});

describe('comparison expressions', () => {
    describe('"!=" expression', () => {
        test('compares against literal null value', () => {
            const response = createExpression(['!=', null, ['get', 'nonexistent-prop']]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "!=" expression');
            }
            expect(response.value.evaluate({zoom: 5})).toBe(false);
        });
    });
    describe('"==" expression', () => {
        test('compares against literal null value', () => {
            const response = createExpression(['==', ['get', 'nonexistent-prop'], null]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "==" expression');
            }
            expect(response.value.evaluate({zoom: 5})).toBe(true);
        });
    });
    describe('"<" expression', () => {
        test('rejects boolean input', () => {
            // @ts-expect-error
            const response = createExpression(['<', -1, true]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing "<" expression');
            }
            expect(response.value[0].message).toBe('"<" comparisons are not supported for type \'boolean\'.');
        });
    });
    describe('"<=" expression', () => {
        test('rejects boolean input', () => {
            // @ts-expect-error
            const response = createExpression(['<=', 0, true]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing "<=" expression');
            }
            expect(response.value[0].message).toBe('"<=" comparisons are not supported for type \'boolean\'.');
        });
    });
    describe('">" expression', () => {
        test('rejects boolean input', () => {
            // @ts-expect-error
            const response = createExpression(['>', 1, true]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing ">" expression');
            }
            expect(response.value[0].message).toBe('">" comparisons are not supported for type \'boolean\'.');
        });
    });
    describe('">=" expression', () => {
        test('rejects boolean input', () => {
            // @ts-expect-error
            const response = createExpression(['>=', 1, true]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing ">=" expression');
            }
            expect(response.value[0].message).toBe('">=" comparisons are not supported for type \'boolean\'.');
        });
    });
});

describe('"case" expression', () => {
    test('returns null if matching case has literal null output', () => {
        const response = createExpression(['case', false, ['get', 'prop'], true, null, 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "case" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBeNull();
    });
    test('returns null if no case matches and fallback is null', () => {
        const response = createExpression(['case', false, ['get', 'prop'], null]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "case" expression');
        }
        expect(response.value.evaluate(
            {zoom: 4},
            undefined,
            {prop: 'fallthrough'},
        )).toBeNull();
    });
});

describe('"match" expression', () => {
    test('requires input to be string if labels are string or string array', () => {
        const response = createExpression(['match', 4, '4', 'o1', ['5', '6'], 'o2', 'fallback']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "match" expression');
        }
        expect(response.value[0].message).toBe('Expected string but found number instead.');
    });
    test('requires input to be number if labels are number or number array', () => {
        const response = createExpression(['match', '4', 4, 'o1', [5, 6], 'o2', 'fallback']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "match" expression');
        }
        expect(response.value[0].message).toBe('Expected number but found string instead.');
    });
    test('requires label to be string literal, number literal, string literal array, or number literal array', () => {
        const invalidResponses = [
            // @ts-expect-error
            createExpression(['match', 4, true, 'matched', 'fallback']),
            // @ts-expect-error
            createExpression(['match', 4, [true], 'matched', 'fallback']),
            // @ts-expect-error
            createExpression(['match', 4, [4, '4'], 'matched', 'fallback']),
            // @ts-expect-error
            createExpression(['match', 4, ['literal', [4]], 'matched', 'fallback']),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
    });
    test('rejects a (string | string[]) label if another label is (number | number[])', () => {
        const invalidResponses = [
            createExpression(['match', 4, 4, 'o1', '4', 'o2', 'fallback']),
            createExpression(['match', 4, 4, 'o1', ['4'], 'o2', 'fallback']),
            createExpression(['match', 4, [4], 'o1', '4', 'o2', 'fallback']),
            createExpression(['match', 4, [4], 'o1', ['4'], 'o2', 'fallback']),
        ];
        for (const response of invalidResponses) {
            expect(response.result).toBe('error');
        }
    });
    test('matches number input against number label', () => {
        const response = createExpression(['match', 2, [0], 'o1', 1, 'o2', 2, 'o3', 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "match" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBe('o3');
    });
    test('matches string input against string label', () => {
        const response = createExpression(['match', 'c', 'a', 'o1', ['b'], 'o2', 'c', 'o3', 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "match" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBe('o3');
    });
    test('matches number input against number array label', () => {
        const response = createExpression(['match', 2, 0, 'o1', [1, 2, 3], 'o2', 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "match" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBe('o2');
    });
    test('matches string input against string array label', () => {
        const response = createExpression(['match', 'c', 'a', 'o1', ['b', 'c', 'd'], 'o2', 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "match" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBe('o2');
    });
    test('returns null if match has literal null output', () => {
        const response = createExpression(['match', 1, 0, ['get', 'prop'], 1, null, 'fallback']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "match" expression');
        }
        expect(response.value.evaluate(
            {zoom: 4},
            undefined,
            {prop: 'should not be returned'},
        )).toBeNull();
    });
});

describe('"within" expression', () => {
    describe('requires a GeoJSON input', () => {
        // @ts-expect-error
        const response = createExpression(['within']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "within" expression');
        }
        expect(response.value[0].message).toBe('\'within\' expression requires exactly one argument, but found 0 instead.');
    });
    describe('rejects an expression as input', () => {
        // @ts-expect-error
        const response = createExpression(['within', ['literal', {type: 'Polygon', coordinates: []}]]);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "within" expression');
        }
        expect(response.value[0].message).toBe('\'within\' expression requires valid geojson object that contains polygon geometry type.');
    });
    describe('rejects a second argument', () => {
        // @ts-expect-error
        const response = createExpression(['within', {type: 'Polygon', coordinates: []}, 'second arg']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "within" expression');
        }
        expect(response.value[0].message).toBe('\'within\' expression requires exactly one argument, but found 2 instead.');
    });
    describe('returns true if feature fully contained within input GeoJSON geometry', () => {
        const response = createExpression(['within', {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]],
        }]);
        if (response.result === 'error') {
            throw new Error('Failed to parse "within" expression');
        }
        const canonical = {z: 10, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        getGeometry(featureInTile, {type: 'Point', coordinates: [2, 2]}, canonical);
        expect(response.value.evaluate({zoom: 10}, featureInTile, {}, canonical)).toBe(true);
    });
});

describe('interpolation expressions', () => {
    describe('linear interpolation type', () => {
        test('ignores any additional arguments', () => {
            const noArgResponse = createExpression(['interpolate', ['linear'], ['zoom'], 4, 0, 10, 100]);
            // @ts-expect-error: type stricter than implementation
            const additionalArgResponse = createExpression(['interpolate', ['linear', 0.8], ['zoom'], 4, 0, 10, 100]);
            if (noArgResponse.result === 'error' || additionalArgResponse.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(noArgResponse.value.evaluate({zoom: 4})).toEqual(additionalArgResponse.value.evaluate({zoom: 4}));
            expect(noArgResponse.value.evaluate({zoom: 7})).toEqual(additionalArgResponse.value.evaluate({zoom: 7}));
            expect(noArgResponse.value.evaluate({zoom: 10})).toEqual(additionalArgResponse.value.evaluate({zoom: 10}));
        });
        test('interpolates between the given values linearly', () => {
            const response = createExpression(['interpolate', ['linear'], ['zoom'], 0, 10, 1, 20]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toBe(10);
            expect(response.value.evaluate({zoom: 0.25})).toBe(12.5);
            expect(response.value.evaluate({zoom: 0.5})).toBe(15);
            expect(response.value.evaluate({zoom: 0.75})).toBe(17.5);
            expect(response.value.evaluate({zoom: 1})).toBe(20);
        });
    });

    describe('exponential interpolation type', () => {
        test('requires a number literal as the base argument', () => {
            // @ts-expect-error
            const response = createExpression(['interpolate', ['exponential', ['+', 0.1, 0.4]], ['zoom'], 0, 10, 1, 100]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing "interpolate" expression');
            }
            expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
            expect(response.value[0].message).toBe('Exponential interpolation requires a numeric base.');
        });
        test('ignores any additional arguments', () => {
            const oneArgResponse = createExpression(['interpolate', ['exponential', 0.5], ['zoom'], 4, 0, 10, 100]);
            // @ts-expect-error: type stricter than implementation
            const additionalArgResponse = createExpression(['interpolate', ['exponential', 0.5, 42], ['zoom'], 4, 0, 10, 100]);
            if (oneArgResponse.result === 'error' || additionalArgResponse.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(oneArgResponse.value.evaluate({zoom: 4})).toEqual(additionalArgResponse.value.evaluate({zoom: 4}));
            expect(oneArgResponse.value.evaluate({zoom: 7})).toEqual(additionalArgResponse.value.evaluate({zoom: 7}));
            expect(oneArgResponse.value.evaluate({zoom: 10})).toEqual(additionalArgResponse.value.evaluate({zoom: 10}));
        });
        test('interpolates between the given values exponentially', () => {
            const response = createExpression(['interpolate', ['exponential', 1.1], ['zoom'], 0, 10, 1, 20]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toBe(10);
            expect(response.value.evaluate({zoom: 0.2})).toBeLessThan(12);
            expect(response.value.evaluate({zoom: 0.5})).toBeLessThan(15);
            expect(response.value.evaluate({zoom: 0.8})).toBeLessThan(18);
            expect(response.value.evaluate({zoom: 1})).toBe(20);
        });
    });

    describe('cubic-bezier interpolation type', () => {
        test('requires four numeric literal control point arguments', () => {
            // @ts-expect-error
            const response = createExpression(['interpolate', ['cubic-bezier', 0.4, 0, ['literal', 0.6], 1], ['zoom'], 2, 0, 8, 100]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing "interpolate" expression');
            }
            expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
            expect(response.value[0].message).toBe('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.');
        });
        test('rejects a fifth control point argument', () => {
            // @ts-expect-error
            const response = createExpression(['interpolate', ['cubic-bezier', 0.4, 0, 0.6, 1, 0.8], ['zoom'], 2, 0, 8, 100]);
            if (response.result === 'success') {
                throw new Error('Unexpectedly succeeded in parsing "interpolate" expression');
            }
            expect(response.value[0]).toBeInstanceOf(ExpressionParsingError);
            expect(response.value[0].message).toBe('Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.');
        });
        test('interpolates between the given values with a cubic bezier curve', () => {
            const response = createExpression(['interpolate', ['cubic-bezier', 0.4, 0, 0.6, 1], ['zoom'], 0, 0, 10, 100]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toBe(0);
            expect(response.value.evaluate({zoom: 3})).toBeLessThan(30);
            expect(response.value.evaluate({zoom: 5})).toBe(50);
            expect(response.value.evaluate({zoom: 7})).toBeGreaterThan(70);
            expect(response.value.evaluate({zoom: 10})).toBe(100);
        });
    });

    describe('"interpolate" expression', () => {
        test('requires stop outputs to be a number, color, number array, color array, or projection', () => {
            const invalidResponses = [
                createExpression(['interpolate', ['linear'], ['zoom'], 0, 'reddish', 2, 'greenish']),
                createExpression(['interpolate', ['linear'], ['zoom'], 0, null, 2, 256]),
                // @ts-expect-error
                createExpression(['interpolate', ['linear'], ['zoom'], 0, false, 2, 1024]),
                // @ts-expect-error
                createExpression(['interpolate', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]),
                // @ts-expect-error
                createExpression(['interpolate', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]),
            ];
            for (const response of invalidResponses) {
                expect(response.result).toBe('error');
            }
        });
        test('interpolates between number outputs', () => {
            const response = createExpression(['interpolate', ['linear'], ['zoom'], 0, 0, 0.5, ['*', 2, 5], 1, 100]);
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 0.25})).toBe(5);
        });
        test('interpolates between color outputs', () => {
            const response = createExpression(
                ['interpolate', ['linear'], ['zoom'], 2, 'white', 4, 'black'],
                {
                    type: 'color',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                    overridable: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toEqual(Color.parse('white'));
            expect(response.value.evaluate({zoom: 3})).toEqual(new Color(0.5, 0.5, 0.5));
            expect(response.value.evaluate({zoom: 4})).toEqual(Color.parse('black'));
        });
        test('interpolates between number array outputs', () => {
            const response = createExpression(
                ['interpolate', ['linear'], ['zoom'], 8, ['literal', [2, 3]], 10, ['literal', [4, 5]]],
                {
                    type: 'numberArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 5}).values).toEqual([2, 3]);
            expect(response.value.evaluate({zoom: 9}).values).toEqual([3, 4]);
            expect(response.value.evaluate({zoom: 10}).values).toEqual([4, 5]);
        });
        test('interpolates between color array outputs', () => {
            const response = createExpression(
                ['interpolate', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]],
                {
                    type: 'colorArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 8}).values).toEqual([Color.parse('white'), Color.parse('black')]);
            expect(response.value.evaluate({zoom: 9}).values).toEqual([new Color(0.5, 0.5, 0.5), new Color(0.5, 0.5, 0.5)]);
            expect(response.value.evaluate({zoom: 10}).values).toEqual([Color.parse('black'), Color.parse('white')]);
        });
        test('interpolates between projection outputs', () => {
            const response = createExpression(
                ['interpolate', ['linear'], ['zoom'], 8, 'vertical-perspective', 10, 'mercator'],
                v8.projection.type as StylePropertySpecification,
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate" expression');
            }
            expect(response.value.evaluate({zoom: 8})).toBe('vertical-perspective');
            expect(response.value.evaluate({zoom: 9})).toEqual({from: 'vertical-perspective', to: 'mercator', transition: 0.5});
            expect(response.value.evaluate({zoom: 16})).toBe('mercator');
        });
    });
    
    describe('"interpolate-hcl" expression', () => {
        test('requires stop outputs to be a color', () => {
            const invalidResponses = [
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, 'reddish', 2, 'greenish']),
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, null, 2, 256]),
                // @ts-expect-error
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, false, 2, 1024]),
                // @ts-expect-error
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]),
                // @ts-expect-error
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]),
                createExpression(['interpolate-hcl', ['linear'], ['zoom'], 0, 10, 1, 100]),
            ];
            for (const response of invalidResponses) {
                expect(response.result).toBe('error');
            }
        });
        test('interpolates between color outputs', () => {
            const response = createExpression(
                ['interpolate-hcl', ['linear'], ['zoom'], 2, 'white', 4, 'black'],
                {
                    type: 'color',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                    overridable: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-hcl" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toEqual(Color.parse('white'));
            expect(response.value.evaluate({zoom: 3})).toEqual(Color.interpolate(
                Color.parse('white'),
                Color.parse('black'),
                0.5,
                'hcl',
            ));
            expect(response.value.evaluate({zoom: 4})).toEqual(Color.parse('black'));
        });
        test('interpolates between color array outputs', () => {
            const response = createExpression(
                ['interpolate-hcl', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]],
                {
                    type: 'colorArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-hcl" expression');
            }
            expect(response.value.evaluate({zoom: 8}).values).toEqual([Color.parse('white'), Color.parse('black')]);
            expect(response.value.evaluate({zoom: 9}).values).toHaveLength(2);
            for (let i = 0; i < 2; i++) {
                expectToMatchColor(response.value.evaluate({zoom: 9}).values[i], 'rgb(46.63266% 46.63266% 46.63266% / 1)');
            }
            expect(response.value.evaluate({zoom: 10}).values).toEqual([Color.parse('black'), Color.parse('white')]);
        });
        test('interpolates between non-literal color array outputs', () => {
            const obj = {'colors-8': ['white', 'black'], 'colors-10': ['black', 'white']};
            const response = createExpression(
                ['interpolate-hcl', ['linear'], ['zoom'], 8, ['get', 'colors-8', ['literal', obj]], 10, ['get', 'colors-10', ['literal', obj]]],
                {
                    type: 'colorArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-hcl" expression');
            }
            expect(response.value.evaluate({zoom: 8}).values).toEqual([Color.parse('white'), Color.parse('black')]);
            expect(response.value.evaluate({zoom: 9}).values).toHaveLength(2);
            for (let i = 0; i < 2; i++) {
                expectToMatchColor(response.value.evaluate({zoom: 9}).values[i], 'rgb(46.63266% 46.63266% 46.63266% / 1)');
            }
            expect(response.value.evaluate({zoom: 10}).values).toEqual([Color.parse('black'), Color.parse('white')]);
        });
    });
    
    describe('"interpolate-lab" expression', () => {
        test('requires stop outputs to be a color', () => {
            const invalidResponses = [
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, 'reddish', 2, 'greenish']),
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, null, 2, 256]),
                // @ts-expect-error
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, false, 2, 1024]),
                // @ts-expect-error
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]),
                // @ts-expect-error
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]),
                createExpression(['interpolate-lab', ['linear'], ['zoom'], 0, 10, 1, 100]),
            ];
            for (const response of invalidResponses) {
                expect(response.result).toBe('error');
            }
        });
        test('interpolates between color outputs', () => {
            const response = createExpression(
                ['interpolate-lab', ['linear'], ['zoom'], 2, 'white', 4, 'black'],
                {
                    type: 'color',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                    overridable: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-lab" expression');
            }
            expect(response.value.evaluate({zoom: 0})).toEqual(Color.parse('white'));
            expect(response.value.evaluate({zoom: 3})).toEqual(Color.interpolate(
                Color.parse('white'),
                Color.parse('black'),
                0.5,
                'lab',
            ));
            expect(response.value.evaluate({zoom: 4})).toEqual(Color.parse('black'));
        });
        test('interpolates between color array outputs', () => {
            const response = createExpression(
                ['interpolate-lab', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]],
                {
                    type: 'colorArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-lab" expression');
            }
            expect(response.value.evaluate({zoom: 8}).values).toEqual([Color.parse('white'), Color.parse('black')]);
            expect(response.value.evaluate({zoom: 9}).values).toHaveLength(2);
            for (let i = 0; i < 2; i++) {
                expectToMatchColor(response.value.evaluate({zoom: 9}).values[i], 'rgb(46.63266% 46.63266% 46.63266% / 1)');
            }
            expect(response.value.evaluate({zoom: 10}).values).toEqual([Color.parse('black'), Color.parse('white')]);
        });
        test('interpolates between non-literal color array outputs', () => {
            const obj = {'colors-8': ['white', 'black'], 'colors-10': ['black', 'white']};
            const response = createExpression(
                ['interpolate-lab', ['linear'], ['zoom'], 8, ['get', 'colors-8', ['literal', obj]], 10, ['get', 'colors-10', ['literal', obj]]],
                {
                    type: 'colorArray',
                    'property-type': 'data-constant',
                    expression: {
                        interpolated: true,
                        parameters: ['zoom'],
                    },
                    transition: false,
                },
            );
            if (response.result === 'error') {
                throw new Error('Failed to parse "interpolate-lab" expression');
            }
            expect(response.value.evaluate({zoom: 8}).values).toEqual([Color.parse('white'), Color.parse('black')]);
            expect(response.value.evaluate({zoom: 9}).values).toHaveLength(2);
            for (let i = 0; i < 2; i++) {
                expectToMatchColor(response.value.evaluate({zoom: 9}).values[i], 'rgb(46.63266% 46.63266% 46.63266% / 1)');
            }
            expect(response.value.evaluate({zoom: 10}).values).toEqual([Color.parse('black'), Color.parse('white')]);
        });
    });
});

describe('"step" expression', () => {
    test('outputs stepped projections', () => {
        const response = createExpression(['step', ['zoom'], 'vertical-perspective', 10, 'mercator']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "step" expression');
        }
        expect(response.value.evaluate({zoom: 5})).toBe('vertical-perspective');
        expect(response.value.evaluate({zoom: 10})).toBe('mercator');
        expect(response.value.evaluate({zoom: 11})).toBe('mercator');
    });
    test('outputs stepped multi-input projections', () => {
        const response = createExpression(
            ['step', ['zoom'], ['literal', ['vertical-perspective', 'mercator', 0.5]], 10, 'mercator'],
            v8.projection.type as StylePropertySpecification,
        );
        if (response.result === 'error') {
            throw new Error('Failed to parse "step" expression');
        }
        expect(response.value.evaluate({zoom: 5})).toStrictEqual(['vertical-perspective', 'mercator', 0.5]);
        expect(response.value.evaluate({zoom: 10})).toBe('mercator');
        expect(response.value.evaluate({zoom: 11})).toBe('mercator');
    });
});

describe('"e" expression', () => {
    test('rejects any arguments', () => {
        // @ts-expect-error
        const response = createExpression(['e', 2]);
        expect(response.result).toBe('error');
    });
    test('returns the mathematical constant e', () => {
        const response = createExpression(['e']);
        if (response.result === 'error') {
            throw new Error('Failed to parse "e" expression');
        }
        expect(response.value.evaluate({zoom: 4})).toBe(Math.E);
    });
});

describe('nonexistent operators', () => {
    test('"ExpressionSpecification" operator does not exist', () => {
        // @ts-expect-error
        const response = createExpression(['ExpressionSpecification']);
        if (response.result === 'success') {
            throw new Error('Unexpectedly succeeded in parsing "ExpressionSpecification" expression');
        }
        expect(response.value[0].message).toContain('Unknown expression \"ExpressionSpecification\".');
    });
});

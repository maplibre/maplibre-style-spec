import {createPropertyExpression, Feature, GlobalProperties, StylePropertyExpression} from '../expression';
import definitions from './definitions';
import v8 from '../reference/v8.json' assert {type: 'json'};
import {createExpression, ICanonicalTileID, StyleExpression, StylePropertySpecification} from '..';
import ParsingError from './parsing_error';
import {VariableAnchorOffsetCollection} from './values';
import {getGeometry} from '../../test/lib/geometry';

// filter out interal "error" and "filter-*" expressions from definition list
const filterExpressionRegex = /filter-/;
const definitionList = Object.keys(definitions).filter((expression) => {
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
        expect((value as ParsingError[])).toHaveLength(1);
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
            const response = createExpression(['distance']);
            expect(response.result).toBe('error');
        });
        test('invalid geometry', () => {
            const response = createExpression(['distance', {type: 'Nope!'}]);
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
                        }
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

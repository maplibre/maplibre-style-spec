import {createPropertyExpression, Feature, GlobalProperties, StylePropertyExpression} from '../expression';
import definitions from './definitions';
import v8 from '../reference/v8.json' with {type: 'json'};
import {createExpression, ICanonicalTileID, StyleExpression, StylePropertySpecification} from '..';
import ParsingError from './parsing_error';
import {VariableAnchorOffsetCollection} from './values';
import {getGeometry} from '../../test/lib/geometry';

// filter out internal "error" and "filter-*" expressions from definition list
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

describe('index-of expression', () => {
    test('requires a needle', () => {
        const response = createExpression(['index-of']);
        expect(response.result).toBe('error');
    });
    test('requires a haystack', () => {
        const response = createExpression(['index-of', 'a']);
        expect(response.result).toBe('error');
    });
    test('rejects a fourth argument', () => {
        const response = createExpression(['index-of', 'a', 'abc', 1, 8]);
        expect(response.result).toBe('error');
    });
    test('requires a primitive as the needle', () => {
        const response = createExpression(['index-of', ['literal', ['a']], ['a', 'b', 'c']]);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the haystack', () => {
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
});

describe('length expression', () => {
    test('requires an argument', () => {
        const response = createExpression(['length']);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the argument', () => {
        const response = createExpression(['length', true]);
        expect(response.result).toBe('error');
    });
    test('rejects a second argument', () => {
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

describe('slice expression', () => {
    test('requires an input argument', () => {
        const response = createExpression(['slice']);
        expect(response.result).toBe('error');
    });
    test('requires a start index argument', () => {
        const response = createExpression(['slice', 'abc']);
        expect(response.result).toBe('error');
    });
    test('rejects a fourth argument', () => {
        const response = createExpression(['slice', 'abc', 0, 1, 8]);
        expect(response.result).toBe('error');
    });
    test('requires a string or array as the input argument', () => {
        const response = createExpression(['slice', true, 0]);
        expect(response.result).toBe('error');
    });
    test('requires a number as the start index argument', () => {
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

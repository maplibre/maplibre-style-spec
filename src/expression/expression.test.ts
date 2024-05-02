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

    test('expression, distance from point', () => {
        const response = createExpression(
            ['distance', {'type': 'Point', coordinates: [3, 3]}],
            {
                type: 'number',
                'property-type': 'data-constant',
                expression: {
                    'interpolated': false,
                    'parameters': ['zoom']
                }
            } as StylePropertySpecification);
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        const value = response.value as StyleExpression;
        getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3.001]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        getGeometry(featureInTile, {type: 'Point', coordinates: [3.001, 3]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        getGeometry(featureInTile, {type: 'LineString', coordinates: [[2, 3], [4, 3]]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        getGeometry(featureInTile, {type: 'LineString', coordinates: [[3, 2], [3, 4]]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
    });

    test('expression, distance from line', () => {
        const response = createExpression(
            ['distance', {'type': 'LineString', coordinates: [[3, 3], [3, 4]]}],
            {
                type: 'number',
                'property-type': 'data-constant',
                expression: {
                    'interpolated': false,
                    'parameters': ['zoom']
                }
            } as StylePropertySpecification);
        const canonical = {z: 20, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        const value = response.value as StyleExpression;
        getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(0, 2);
        getGeometry(featureInTile, {type: 'Point', coordinates: [3, 3.001]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(110.5, 0);
        getGeometry(featureInTile, {type: 'Point', coordinates: [3.001, 3]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        getGeometry(featureInTile, {type: 'LineString', coordinates: [[3.001, 3], [3.001, 4]]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBeCloseTo(111.1, 0);
        getGeometry(featureInTile, {type: 'LineString', coordinates: [[2.5, 3.5], [3.5, 3.5]]}, canonical);
        expect(value.evaluate({zoom: 20}, featureInTile, {}, canonical)).toBe(0);
    });

    // HM TODO: polygon tests
});

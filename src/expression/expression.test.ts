import {
    createPropertyExpression,
    Feature,
    GlobalProperties,
    StylePropertyExpression
} from '../expression';
import {expressions} from './definitions';
import v8 from '../reference/v8.json' with {type: 'json'};
import {createExpression, StylePropertySpecification} from '..';
import {ExpressionParsingError} from './parsing_error';
import {VariableAnchorOffsetCollection} from './types/variable_anchor_offset_collection';
import {describe, test, expect, vi} from 'vitest';

// filter out internal "error" and "filter-*" expressions from definition list
const filterExpressionRegex = /filter-/;
const definitionList = Object.keys(expressions)
    .filter((expression) => {
        return expression !== 'error' && !filterExpressionRegex.exec(expression);
    })
    .sort();

test('v8.json includes all definitions from style-spec', () => {
    const v8List = Object.keys(v8.expression_name.values);
    const v8SupportedList = v8List.filter((expression) => {
        //filter out expressions that are not supported in GL-JS
        return !!v8.expression_name.values[expression]['sdk-support']['basic functionality']['js'];
    });
    expect(definitionList).toEqual(v8SupportedList.sort());
});

describe('createPropertyExpression', () => {
    test('prohibits non-interpolable properties from using an "interpolate" expression', () => {
        const {result, value} = createPropertyExpression(
            ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 10],
            {
                type: 'number',
                'property-type': 'data-constant',
                expression: {
                    interpolated: false,
                    parameters: ['zoom']
                }
            } as StylePropertySpecification
        );
        expect(result).toBe('error');
        expect(value as ExpressionParsingError[]).toHaveLength(1);
        expect(value[0].message).toBe(
            '"interpolate" expressions cannot be used with this property'
        );
    });

    test('sets globalStateRefs', () => {
        const {value} = createPropertyExpression(
            [
                'case',
                ['>', ['global-state', 'stateKey'], 0],
                100,
                ['global-state', 'anotherStateKey']
            ],
            {
                type: 'number',
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as any as StylePropertySpecification
        ) as {value: StylePropertyExpression};

        expect(value.globalStateRefs).toEqual(new Set(['stateKey', 'anotherStateKey']));
    });
});

describe('evaluate expression', () => {
    test('silently falls back to default for nullish values', () => {
        const {value} = createPropertyExpression(['global-state', 'x'], {
            type: null,
            default: 42,
            'property-type': 'data-driven',
            transition: false
        }) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({globalState: {x: 5}, zoom: 10} as GlobalProperties)).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();

        expect(value.evaluate({globalState: {}, zoom: 10} as GlobalProperties)).toBe(42);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state as expression property', () => {
        const {value} = createPropertyExpression(
            ['global-state', 'x'],
            {
                type: null,
                default: 42,
                'property-type': 'data-driven',
                transition: false
            },
            {x: 5}
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({globalState: {x: 15}, zoom: 10} as GlobalProperties)).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state as expression property of zoom dependent expression', () => {
        const {value} = createPropertyExpression(
            ['interpolate', ['linear'], ['zoom'], 10, ['global-state', 'x'], 20, 50],
            {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: true,
                    parameters: ['zoom']
                }
            } as StylePropertySpecification,
            {x: 5}
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({globalState: {x: 15}, zoom: 10} as GlobalProperties)).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('warns and falls back to default for invalid enum values', () => {
        const {value} = createPropertyExpression(['get', 'x'], {
            type: 'enum',
            values: {a: {}, b: {}, c: {}},
            default: 'a',
            'property-type': 'data-driven',
            expression: {
                interpolated: false,
                parameters: ['zoom', 'feature']
            }
        } as any as StylePropertySpecification) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.kind).toBe('source');

        expect(
            value.evaluate({} as GlobalProperties, {properties: {x: 'b'}} as any as Feature)
        ).toBe('b');
        expect(
            value.evaluate({} as GlobalProperties, {properties: {x: 'invalid'}} as any as Feature)
        ).toBe('a');
        expect(console.warn).toHaveBeenCalledWith(
            'Expected value to be one of "a", "b", "c", but found "invalid" instead.'
        );
    });

    test('warns for invalid variableAnchorOffsetCollection values', () => {
        const {value} = createPropertyExpression(['get', 'x'], {
            type: 'variableAnchorOffsetCollection',
            'property-type': 'data-driven',
            transition: false,
            expression: {
                interpolated: false,
                parameters: ['zoom', 'feature']
            }
        }) as {value: StylePropertyExpression};

        const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.kind).toBe('source');

        expect(
            value.evaluate({} as GlobalProperties, {properties: {x: 'invalid'}} as any as Feature)
        ).toBeNull();
        expect(console.warn).toHaveBeenCalledTimes(2);
        expect(console.warn).toHaveBeenCalledWith(
            "Could not parse variableAnchorOffsetCollection from value 'invalid'"
        );

        warnMock.mockClear();
        expect(
            value.evaluate(
                {} as GlobalProperties,
                {properties: {x: ['top', [2, 2]]}} as any as Feature
            )
        ).toEqual(new VariableAnchorOffsetCollection(['top', [2, 2]]));
        expect(console.warn).not.toHaveBeenCalled();
    });
});

describe('nonexistent operators', () => {
    test('"ExpressionSpecification" operator does not exist', () => {
        const response = createExpression(['ExpressionSpecification']);
        expect(response.result).toBe('error');
        expect((response.value as ExpressionParsingError[])[0].message).toContain(
            'Unknown expression \"ExpressionSpecification\".'
        );
    });
});

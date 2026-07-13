import {
    createPropertyExpression,
    normalizePropertyExpression,
    Feature,
    GlobalProperties,
    StylePropertyExpression
} from '../expression';
import {expressions} from './definitions';
import v8 from '../reference/v8.json' with {type: 'json'};
import {createExpression, StylePropertySpecification} from '..';
import {ExpressionParsingError} from './parsing_error';
import {VariableAnchorOffsetCollection} from './types/variable_anchor_offset_collection';
import {assert, describe, test, expect, vi} from 'vitest';

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
            'layers[0].paint.line-width',
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
            'layers[0].paint.line-width',
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
        const {value} = createPropertyExpression(
            ['global-state', 'x'],
            'layers[0].paint.line-width',
            {
                type: null,
                default: 42,
                'property-type': 'data-driven',
                transition: false
            }
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({globalState: {x: 5}, zoom: 10} as GlobalProperties)).toBe(5);
        expect(console.warn).not.toHaveBeenCalled();

        expect(value.evaluate({globalState: {}, zoom: 10} as GlobalProperties)).toBe(42);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state as expression property', () => {
        const {value} = createPropertyExpression(
            ['global-state', 'x'],
            'layers[0].paint.line-width',
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
            'layers[0].paint.line-width',
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

    test('a failing assertion warns with its property location and the fallback value', () => {
        const {value} = createPropertyExpression(
            ['number', ['get', 'x']],
            'layers[0].paint.line-width',
            {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as StylePropertySpecification
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({} as GlobalProperties, {properties: {}} as any as Feature)).toBe(42);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].paint.line-width: Expected value to be of type number, but found null instead. Falling back to 42.'
        );
    });

    test('an empty rootKey throws at construction, because not actionable', () => {
        expect(() =>
            createPropertyExpression(['number', ['get', 'x']], '', {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as StylePropertySpecification)
        ).toThrow('rootKey must identify the location of the expression in the style JSON');
    });

    test('a nested failure appends its parser index path after the rootKey', () => {
        const {value} = createPropertyExpression(
            ['case', false, ['number', ['get', 'a']], ['number', ['get', 'b']]],
            'layers[0].paint.line-width',
            {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as StylePropertySpecification
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({} as GlobalProperties, {properties: {}} as any as Feature)).toBe(42);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].paint.line-width[3]: Expected value to be of type number, but found null instead. Falling back to 42.'
        );
    });

    test('sibling throw sites each warn once, deduped by path and message', () => {
        const {value} = createPropertyExpression(
            ['case', ['==', ['get', 't'], 1], ['number', ['get', 'a']], ['number', ['get', 'b']]],
            'layers[0].paint.line-width',
            {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as StylePropertySpecification
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Trigger the first arm (index 2), then the default arm (index 3).
        expect(value.evaluate({} as GlobalProperties, {properties: {t: 1}} as any as Feature)).toBe(
            42
        );
        expect(value.evaluate({} as GlobalProperties, {properties: {t: 2}} as any as Feature)).toBe(
            42
        );
        expect(console.warn).toHaveBeenCalledTimes(2);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].paint.line-width[2]: Expected value to be of type number, but found null instead. Falling back to 42.'
        );
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].paint.line-width[3]: Expected value to be of type number, but found null instead. Falling back to 42.'
        );
    });

    test('an auto-wrapped assertion carries its nested index path, because bare `["get"]` arms get implicitly wrapped in an assertion', () => {
        const {value} = createPropertyExpression(
            ['case', false, ['get', 'a'], ['get', 'b']],
            'layers[0].paint.line-width',
            {
                type: 'number',
                default: 42,
                'property-type': 'data-driven',
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            } as StylePropertySpecification
        ) as {value: StylePropertyExpression};

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate({} as GlobalProperties, {properties: {}} as any as Feature)).toBe(42);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].paint.line-width[3]: Expected value to be of type number, but found null instead. Falling back to 42.'
        );
    });

    test('warns and falls back to default for invalid enum values', () => {
        const {value} = createPropertyExpression(['get', 'x'], 'layers[0].layout.text-justify', {
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
            'layers[0].layout.text-justify: Expected value to be one of "a", "b", "c", but found "invalid" instead. Falling back to a.'
        );
    });

    test('warns for invalid variableAnchorOffsetCollection values', () => {
        const {value} = createPropertyExpression(
            ['get', 'x'],
            'layers[0].layout.text-variable-anchor-offset',
            {
                type: 'variableAnchorOffsetCollection',
                'property-type': 'data-driven',
                transition: false,
                expression: {
                    interpolated: false,
                    parameters: ['zoom', 'feature']
                }
            }
        ) as {value: StylePropertyExpression};

        const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.kind).toBe('source');

        expect(
            value.evaluate({} as GlobalProperties, {properties: {x: 'invalid'}} as any as Feature)
        ).toBeNull();
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            "layers[0].layout.text-variable-anchor-offset: Could not parse variableAnchorOffsetCollection from value 'invalid'"
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

describe('actionable warnings: runtime throw sites carry their index path', () => {
    function warnFor(expression: unknown, properties: Feature['properties']): string {
        const expr = createExpression(expression, 'rk', null);
        assert(expr.result === 'success');
        const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expr.value.evaluate({zoom: 0}, {type: 'Point', properties});
        expect(warnMock).toHaveBeenCalledTimes(1);
        const message = warnMock.mock.calls[0][0] as string;
        warnMock.mockRestore();
        return message;
    }

    test('["at"] with an out-of-bounds index', () => {
        expect(warnFor(['typeof', ['at', ['get', 'i'], ['literal', [1, 2, 3]]]], {i: 5})).toBe(
            'rk[1]: Array index out of bounds: 5 > 2.'
        );
    });

    test('["length"] of a non-array/string value', () => {
        expect(warnFor(['typeof', ['length', ['get', 'x']]], {x: 5})).toBe(
            'rk[1]: Expected value to be of type string or array, but found number instead.'
        );
    });

    test('["index-of"] in a non-array/string haystack', () => {
        expect(warnFor(['typeof', ['index-of', ['get', 'n'], ['get', 'h']]], {n: 'a', h: 5})).toBe(
            'rk[1]: Expected second argument to be of type array or string, but found number instead.'
        );
    });

    test('["slice"] of a non-array/string value', () => {
        expect(warnFor(['typeof', ['slice', ['get', 'x'], 0]], {x: 5})).toBe(
            'rk[1]: Expected first argument to be of type array or string, but found number instead.'
        );
    });

    test('["in"] with a non-array/string haystack', () => {
        expect(warnFor(['typeof', ['in', ['get', 'n'], ['get', 'h']]], {n: 'a', h: 5})).toBe(
            'rk[1]: Expected second argument to be of type array or string, but found number instead.'
        );
    });

    test('["to-color"] of an unparseable value', () => {
        expect(warnFor(['typeof', ['to-color', ['get', 'c']]], {c: 'notacolor'})).toBe(
            "rk[1]: Could not parse color from value 'notacolor'"
        );
    });

    test('ordering comparison of mismatched types', () => {
        expect(warnFor(['typeof', ['>', ['get', 'a'], ['get', 'b']]], {a: 'x', b: 5})).toBe(
            'rk[1]: Expected arguments for ">" to be (string, string) or (number, number), but found (string, number) instead.'
        );
    });

    test('user-emitted ["error"] is prefixed with the rootKey (no compound sub-path)', () => {
        // Compound expressions don't carry a parser sub-path, so the message is
        // anchored at the property root only.
        expect(warnFor(['error', 'boom'], {})).toBe('rk: boom');
    });
});

describe('actionable warnings: fallback rendering', () => {
    function warnFor(
        expression: unknown,
        propertySpec: StylePropertySpecification,
        feature: any
    ): string {
        const expr = createExpression(expression, 'rk', propertySpec);
        assert(expr.result === 'success');
        const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expr.value.evaluate({} as GlobalProperties, {properties: feature} as any as Feature);
        const message = warnMock.mock.calls[0]?.[0] as string;
        warnMock.mockRestore();
        return message;
    }

    test('color default renders as rgba(...)', () => {
        expect(
            warnFor(
                ['to-color', ['get', 'c']],
                {type: 'color', default: 'red'} as any as StylePropertySpecification,
                {c: 'notacolor'}
            )
        ).toBe("rk: Could not parse color from value 'notacolor' Falling back to rgba(255,0,0,1).");
    });

    test('padding default renders as a JSON array', () => {
        expect(
            warnFor(
                ['get', 'p'],
                {type: 'padding', default: [5, 5, 5, 5]} as any as StylePropertySpecification,
                {p: 'notpadding'}
            )
        ).toBe("rk: Could not parse padding from value 'notpadding' Falling back to [5,5,5,5].");
    });

    test('numberArray default renders as a JSON array', () => {
        expect(
            warnFor(
                ['get', 'n'],
                {type: 'numberArray', default: [1, 2, 3]} as any as StylePropertySpecification,
                {n: 'notarray'}
            )
        ).toBe("rk: Could not parse numberArray from value 'notarray' Falling back to [1,2,3].");
    });

    test('projectionDefinition default renders as a string', () => {
        expect(
            warnFor(
                ['at', ['get', 'i'], ['literal', []]],
                {
                    type: 'projectionDefinition',
                    default: 'mercator'
                } as any as StylePropertySpecification,
                {i: 5}
            )
        ).toBe('rk: Array index out of bounds: 5 > -1. Falling back to mercator.');
    });

    test('null default omits the fallback suffix entirely', () => {
        expect(
            warnFor(
                ['number', ['get', 'x']],
                {type: 'number'} as any as StylePropertySpecification,
                {}
            )
        ).toBe('rk: Expected value to be of type number, but found null instead.');
    });
});

describe('actionable warnings: interpolation and legacy functions', () => {
    const vaocSpec = {
        type: 'variableAnchorOffsetCollection',
        'property-type': 'data-driven',
        transition: false,
        expression: {interpolated: true, parameters: ['zoom', 'feature']}
    } as any as StylePropertySpecification;

    test('a nested ["interpolate"] throw carries its index path (mismatched value lengths)', () => {
        // Nested so the interpolate's parser key is non-empty; a top-level
        // interpolate would have path '' and wouldn't prove the instrumentation.
        const expr = createPropertyExpression(
            [
                'case',
                false,
                ['literal', ['top', [0, 0]]],
                [
                    'interpolate',
                    ['linear'],
                    ['get', 't'],
                    0,
                    ['literal', ['top', [0, 0]]],
                    10,
                    ['literal', ['top', [0, 0], 'bottom', [1, 1]]]
                ]
            ],
            'rk',
            vaocSpec
        );
        assert(expr.result === 'success');

        vi.spyOn(console, 'warn').mockImplementation(() => {});
        expr.value.evaluate({zoom: 0} as GlobalProperties, {properties: {t: 5}} as any as Feature);

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            'rk[3]: Cannot interpolate values of different length. from: ["top",[0,0]], to: ["top",[0,0],"bottom",[1,1]]'
        );
    });

    test('a legacy stop function throw warns with the property location and falls back', () => {
        // A stop that parses to null makes the interpolation dereference null at
        // evaluation; the wrapper must warn with the location and fall back rather
        // than propagate the throw to the caller.
        const value = normalizePropertyExpression(
            {
                type: 'exponential',
                stops: [
                    [0, [1, 2]],
                    [10, 'notanarray']
                ]
            } as any,
            'rk',
            {
                type: 'numberArray',
                'property-type': 'data-driven',
                transition: false,
                expression: {interpolated: true, parameters: ['zoom']}
            } as any as StylePropertySpecification
        );

        vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(() => value.evaluate({zoom: 5} as GlobalProperties)).not.toThrow();
        expect(console.warn).toHaveBeenCalledTimes(1);
        // The error body is an engine-owned TypeError string; assert only the
        // location prefix that this code is responsible for.
        expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/^rk: /));
    });
});

describe('nonexistent operators', () => {
    test('"ExpressionSpecification" operator does not exist', () => {
        const response = createExpression(['ExpressionSpecification'], 'layers[0].filter');
        expect(response.result).toBe('error');
        expect((response.value as ExpressionParsingError[])[0].message).toContain(
            'Unknown expression \"ExpressionSpecification\".'
        );
    });
});

import {normalizePropertyExpression, StyleExpression, StylePropertyFunction} from '.';
import {StylePropertySpecification} from '..';
import {Color} from './types/color';
import {ColorArray} from './types/color_array';
import {NumberArray} from './types/number_array';
import {Padding} from './types/padding';
import type {Expression} from './expression';
import {describe, test, expect, vi, beforeEach, afterEach, type MockInstance} from 'vitest';

// Every test in this file is a happy path: none may emit a runtime warning.
let warnSpy: MockInstance;
beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
});

function stylePropertySpecification(type): StylePropertySpecification {
    return {
        type: type,
        'property-type': 'constant',
        expression: {
            interpolated: false,
            parameters: []
        },
        transition: false
    };
}

describe('normalizePropertyExpression expressions', () => {
    test('normalizePropertyExpression<ColorArray>', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ['literal', ['#FF0000', 'black']],
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ['literal', '#FF0000'],
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            ['literal', [1, 2]],
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            ['literal', 1],
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            ['literal', [1, 2]],
            'layers[0].layout.icon-padding',
            stylePropertySpecification('padding')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2, 1, 2]);
    });
});

describe('normalizePropertyExpression objects', () => {
    test('normalizePropertyExpression<ColorArray>', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ColorArray.parse(['#FF0000', 'black']),
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ColorArray.parse('#FF0000'),
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            NumberArray.parse([1, 2]),
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            NumberArray.parse(1),
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            Padding.parse([1, 2]),
            'layers[0].layout.icon-padding',
            stylePropertySpecification('padding')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2, 1, 2]);
    });
});

describe('normalizePropertyExpression raw values', () => {
    test('normalizePropertyExpression<ColorArray>', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ['#FF0000', 'black'] as any,
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            '#FF0000' as any,
            'layers[0].paint.hillshade-shadow-color',
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            [1, 2] as any,
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            1 as any,
            'layers[0].paint.hillshade-illumination-direction',
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            [1, 2] as any,
            'layers[0].layout.icon-padding',
            stylePropertySpecification('padding')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2, 1, 2]);
    });
});

describe('StyleExpressions', () => {
    test('ignore random fields when adding global state ', () => {
        const expression = {
            evaluate: vi.fn()
        } as any as Expression;
        const styleExpression = new StyleExpression(
            expression,
            'layers[0].paint.line-width',
            {
                type: null,
                default: 42,
                'property-type': 'data-driven',
                transition: false
            } as StylePropertySpecification,
            {x: 5} as Record<string, any>
        );

        styleExpression.evaluate({zoom: 10, a: 20, b: 30} as any);
        expect(expression.evaluate).toHaveBeenCalled();
        const params = (expression.evaluate as any).mock.calls[0][0].globals;
        expect(params).toHaveProperty('zoom', 10);
        expect(params).toHaveProperty('globalState', {x: 5});
        expect(params).not.toHaveProperty('a');
        expect(params).not.toHaveProperty('b');
    });
});

describe('StylePropertyFunction', () => {
    const interpolatableSpec: StylePropertySpecification = {
        type: 'number',
        default: 16,
        'property-type': 'data-driven',
        expression: {interpolated: true, parameters: ['zoom', 'feature']},
        transition: false
    } as StylePropertySpecification;

    test('exposes interpolationType for a legacy camera function that is zoom-interpolatable', () => {
        const expression = normalizePropertyExpression(
            {
                base: 1.4,
                stops: [
                    [10, 8],
                    [20, 14]
                ]
            },
            'layers[0].layout.text-size',
            interpolatableSpec
        ) as StylePropertyFunction<number>;

        expect(expression.kind).toBe('camera');
        expect(expression.zoomStops).toEqual([10, 20]);
        expect(expression.interpolationType).toEqual({name: 'exponential', base: 1.4});
        expect(expression.globalStateRefs.has('foo')).toBe(false);
        expect(expression.globalStateRefs.size).toBe(0);
        expect(expression.isStateDependent).toBe(false);
    });

    test('preserves interpolationType across a serialize/deserialize round trip', () => {
        const original = new StylePropertyFunction(
            {
                base: 1.4,
                stops: [
                    [10, 8],
                    [20, 14]
                ]
            },
            'layers[0].layout.text-size',
            interpolatableSpec
        );
        const roundTripped = StylePropertyFunction.deserialize(
            StylePropertyFunction.serialize(original)
        );

        expect(roundTripped.interpolationType).toEqual({name: 'exponential', base: 1.4});
        expect(roundTripped.zoomStops).toEqual([10, 20]);
    });
});

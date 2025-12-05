import {normalizePropertyExpression, StyleExpression} from '.';
import {StylePropertySpecification} from '..';
import {Color} from './types/color';
import {ColorArray} from './types/color_array';
import {NumberArray} from './types/number_array';
import {Padding} from './types/padding';
import type {Expression} from './expression';
import {describe, test, expect, vi} from 'vitest';

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
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ['literal', '#FF0000'],
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            ['literal', [1, 2]],
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            ['literal', 1],
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            ['literal', [1, 2]],
            stylePropertySpecification('padding')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2, 1, 2]);
    });
});

describe('normalizePropertyExpression objects', () => {
    test('normalizePropertyExpression<ColorArray>', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ColorArray.parse(['#FF0000', 'black']),
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ColorArray.parse('#FF0000'),
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            NumberArray.parse([1, 2]),
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            NumberArray.parse(1),
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            Padding.parse([1, 2]),
            stylePropertySpecification('padding')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2, 1, 2]);
    });
});

describe('normalizePropertyExpression raw values', () => {
    test('normalizePropertyExpression<ColorArray>', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            ['#FF0000', 'black'] as any,
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red, Color.black]);
    });

    test('normalizePropertyExpression<ColorArray> single value', () => {
        const expression = normalizePropertyExpression<ColorArray>(
            '#FF0000' as any,
            stylePropertySpecification('colorArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([Color.red]);
    });

    test('normalizePropertyExpression<NumberArray>', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            [1, 2] as any,
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1, 2]);
    });

    test('normalizePropertyExpression<NumberArray> single value', () => {
        const expression = normalizePropertyExpression<NumberArray>(
            1 as any,
            stylePropertySpecification('numberArray')
        );
        expect(expression.evaluate({zoom: 0}).values).toEqual([1]);
    });

    test('normalizePropertyExpression<Padding>', () => {
        const expression = normalizePropertyExpression<Padding>(
            [1, 2] as any,
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

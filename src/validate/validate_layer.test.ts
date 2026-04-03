import {validate} from './validate';
import {validateLayer} from './validate_layer';
import v8 from '../reference/v8.json' with {type: 'json'};
import {expect, test} from 'vitest';

test.each([
    ['number', 1],
    ['string', '__proto__'],
    ['boolean', true],
    ['array', [{}]],
    ['null', null]
])('Should return error if layer value is %s instead of an object', (valueType, value) => {
    const errors = validateLayer({
        validateSpec: validate,
        value: value,
        styleSpec: v8,
        style: {} as any
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(`object expected, ${valueType} found`);
});

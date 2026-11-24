import {describe, expect, test} from 'vitest';
import {validateSource} from './validate_source';

describe('Validate source', () => {
    test.each([
        [null, 'null'],
        [1, 'number'],
        ['a', 'string'],
        [[], 'array']
    ])('Should return an error if the source is %j', (value, type) => {
        const errors = validateSource({key: 'source', value, style: {}});
        expect(errors).toEqual([
            {message: `source: object expected, ${type} found`, severity: 'error'}
        ]);
    });
});

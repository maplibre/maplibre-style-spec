import validateSpec from './validate';
import validateOffsetCollection from './validate_offsetCollection';

describe('Validate OffsetCollection', () => {
    const styleSpec = {
        '$version': 8
    };

    test('Should return error if type is not array', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: '3'});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: {x: 1, y: 1}});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: NaN});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');
    });

    test('Should return error if array is empty', () => {
        const errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: []});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection requires a non-empty array');
    });

    test('Should return error if array contains non-numeric values', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: ['1', '2']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection must be an array of numbers or points');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [true, false]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection must be an array of numbers or points');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [{x: 1}, {x: 2}]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: offsetCollection must be an array of numbers or points');
    });

    test('Should return error if numeric array does not have exactly two elements', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: array length 2 expected, length 1 found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, 2, 3]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: array length 2 expected, length 3 found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, 2, false]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection: array length 2 expected, length 3 found');
    });

    test('Should return error if numeric array contains non-numeric elements', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, '2']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1]: number expected, string found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [NaN, 6]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0]: number expected, NaN found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, true]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1]: number expected, boolean found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, null]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1]: number expected, null found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, [2]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1]: number expected, array found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, {x: 2}]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1]: number expected, object found');
    });

    test('Should pass if type is 2-element numeric array', () => {
        const errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [1, 2]});
        expect(errors).toHaveLength(0);
    });

    test('Should return error if nested array does not have exactly two elements', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0]: array length 2 expected, length 0 found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0]: array length 2 expected, length 1 found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, 2, 3]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0]: array length 2 expected, length 3 found');
    });

    test('Should return error if nested array contains non-numeric elements', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, '2']]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][1]: number expected, string found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[NaN, 6]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][0]: number expected, NaN found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, true]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][1]: number expected, boolean found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, null]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][1]: number expected, null found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, [2]]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][1]: number expected, array found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, {x: 2}]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[0][1]: number expected, object found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [1, '2']]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][1]: number expected, string found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [NaN, 6]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][0]: number expected, NaN found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [1, true]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][1]: number expected, boolean found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [1, null]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][1]: number expected, null found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [1, [2]]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][1]: number expected, array found');

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[0, 0], [1, {x: 2}]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('offsetCollection[1][1]: number expected, object found');
    });

    test('Should pass if all elements are 2-element numeric arrays', () => {
        let errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, 2]]});
        expect(errors).toHaveLength(0);

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, 2], [3, 4]]});
        expect(errors).toHaveLength(0);

        errors = validateOffsetCollection({validateSpec, styleSpec, key: 'offsetCollection', value: [[1, 2], [3, 4], [5, 6]]});
        expect(errors).toHaveLength(0);
    });
});

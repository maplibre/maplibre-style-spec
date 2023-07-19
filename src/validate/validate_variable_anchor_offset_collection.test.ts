import validate from './validate';
import validateVariableAnchorOffsetCollection from './validate_variable_anchor_offset_collection';
import latestStyleSpec from '../reference/latest';

describe('Validate variableAnchorOffsetCollection', () => {
    const validateOpts = {
        validateSpec: validate,
        styleSpec: latestStyleSpec,
        key: 'myProp',
    };
    test('Should return error if type is not array', () => {
        let errors = validateVariableAnchorOffsetCollection({...validateOpts, value: '3'});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: 3});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: true});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: null});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: {x: 1, y: 1}});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');
    });

    test('Should return error if array has invalid length', () => {
        let errors = validateVariableAnchorOffsetCollection({...validateOpts, value: []});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: [3]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, 0], 'bottom']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp: variableAnchorOffsetCollection requires a non-empty array of even length');
    });

    test('Should return error if array contains invalid anchor', () => {
        let errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['dennis', [0, 0]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[0]: expected one of [center, left, right, top, bottom, top-left, top-right, bottom-left, bottom-right], "dennis" found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, 0], 'dennis', [1, 1], 'not-dennis', [2, 2]]});
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('myProp[2]: expected one of [center, left, right, top, bottom, top-left, top-right, bottom-left, bottom-right], "dennis" found');
        expect(errors[1].message).toBe('myProp[4]: expected one of [center, left, right, top, bottom, top-left, top-right, bottom-left, bottom-right], "not-dennis" found');
    });

    test('Should return error if array contains invalid offset', () => {
        let errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', 'bottom']});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[1]: array expected, string found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', null]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[1]: array expected, null found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', 3]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[1]: array expected, number found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', []]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[1]: array length 2 expected, length 0 found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', ['a', 'b']]});
        expect(errors).toHaveLength(2);
        expect(errors[0].message).toBe('myProp[1][0]: number expected, string found');
        expect(errors[1].message).toBe('myProp[1][1]: number expected, string found');

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, NaN]]});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toBe('myProp[1][1]: number expected, NaN found');
    });

    test('Should pass if array alternates enum and point valies', () => {
        let errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, 0]]});
        expect(errors).toHaveLength(0);

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, 0], 'bottom', [1, 1]]});
        expect(errors).toHaveLength(0);

        errors = validateVariableAnchorOffsetCollection({...validateOpts, value: ['top', [0, 0], 'bottom', [1, 1], 'top-left', [2, 2], 'bottom', [3, 3]]});
        expect(errors).toHaveLength(0);
    });
});

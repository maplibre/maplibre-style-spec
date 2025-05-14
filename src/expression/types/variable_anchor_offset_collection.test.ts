import {VariableAnchorOffsetCollection} from './variable_anchor_offset_collection';
import {describe, test, expect} from 'vitest';

describe('VariableAnchorOffsetCollection', () => {
    test('VariableAnchorOffsetCollection.parse', () => {
        expect(VariableAnchorOffsetCollection.parse()).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(null)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(undefined)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse('Dennis' as any)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(3 as any)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse({} as any)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse([])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['Dennis'])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['top'])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['top', 'bottom'])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['top', 3] as any)).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['Dennis', [2, 2]])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['top', [2, 2]])).toEqual(new VariableAnchorOffsetCollection(['top', [2, 2]]));
        expect(VariableAnchorOffsetCollection.parse(['top', [2, 2], 'bottom'])).toBeUndefined();
        expect(VariableAnchorOffsetCollection.parse(['top', [2, 2], 'bottom', [3, 3]])).toEqual(new VariableAnchorOffsetCollection(['top', [2, 2], 'bottom', [3, 3]]));

        const identity = new VariableAnchorOffsetCollection(['top', [2, 2]]);
        expect(VariableAnchorOffsetCollection.parse(identity)).toBe(identity);
    });

    test('VariableAnchorOffsetCollection#toString', () => {
        const coll = new VariableAnchorOffsetCollection(['top', [2, 2]]);
        expect(coll.toString()).toBe('["top",[2,2]]');
    });

    describe('interpolate variableAnchorOffsetCollection', () => {
        const i11nFn = VariableAnchorOffsetCollection.interpolate;
        const parseFn = VariableAnchorOffsetCollection.parse;

        test('should throw with mismatched endpoints', () => {
            expect(() => i11nFn(parseFn(['top', [0, 0]]), parseFn(['bottom', [1, 1]]), 0.5)).toThrow('Cannot interpolate values containing mismatched anchors. from[0]: top, to[0]: bottom');
            expect(() => i11nFn(parseFn(['top', [0, 0]]), parseFn(['top', [1, 1], 'bottom', [2, 2]]), 0.5)).toThrow('Cannot interpolate values of different length. from: ["top",[0,0]], to: ["top",[1,1],"bottom",[2,2]]');
        });

        test('should interpolate offsets', () => {
            expect(i11nFn(parseFn(['top', [0, 0], 'bottom', [2, 2]]), parseFn(['top', [1, 1], 'bottom', [4, 4]]), 0.5).values).toEqual(['top', [0.5, 0.5], 'bottom', [3, 3]]);
        });
    });
});

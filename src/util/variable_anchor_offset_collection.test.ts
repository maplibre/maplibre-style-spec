import VariableAnchorOffsetCollection from './variable_anchor_offset_collection';

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
});

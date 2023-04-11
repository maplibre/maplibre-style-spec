import OffsetCollection from './offset_collection';

describe('OffsetCollection', () => {
    test('OffsetCollection.parse', () => {
        expect(OffsetCollection.parse()).toBeUndefined();
        expect(OffsetCollection.parse(null)).toBeUndefined();
        expect(OffsetCollection.parse(undefined)).toBeUndefined();
        expect(OffsetCollection.parse('Dennis' as any)).toBeUndefined();
        expect(OffsetCollection.parse('3' as any)).toBeUndefined();
        expect(OffsetCollection.parse([])).toBeUndefined();
        expect(OffsetCollection.parse([3, '4'] as any)).toBeUndefined();
        expect(OffsetCollection.parse([5] as any)).toBeUndefined();
        expect(OffsetCollection.parse([5, 6, 7] as any)).toBeUndefined();
        expect(OffsetCollection.parse(['Dennis'] as any)).toBeUndefined();
        expect(OffsetCollection.parse([1, 'Dennis'] as any)).toBeUndefined();
        expect(OffsetCollection.parse([1, 2, 'Dennis'] as any)).toBeUndefined();
        expect(OffsetCollection.parse([1, 2])).toEqual(new OffsetCollection([[1, 2]]));

        expect(OffsetCollection.parse([[1, 2], []] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2], [3]] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2], [3, 4, 5]] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2], ['Dennis']] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2], [3, 'Dennis']] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2], [3, 4, 'Dennis']] as any)).toBeUndefined();
        expect(OffsetCollection.parse([[1, 2]])).toEqual(new OffsetCollection([[1, 2]]));
        expect(OffsetCollection.parse([[1, 2], [3, 4]])).toEqual(new OffsetCollection([[1, 2], [3, 4]]));

        const passThru = new OffsetCollection([[1, 2]]);
        expect(OffsetCollection.parse(passThru)).toBe(passThru);
    });

    test('OffsetCollection#toString', () => {
        const offsetCollection = new OffsetCollection([[1, 2], [3, 4]]);
        expect(offsetCollection.toString()).toBe('[[1,2],[3,4]]');
    });
});

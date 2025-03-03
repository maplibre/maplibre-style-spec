describe('has_own', () => {
    describe('sanity tests', () => {
        let hasOwn: (o: object, k: PropertyKey) => boolean;

        beforeAll(async () => {
            const res = await import('./has_own');
            hasOwn = res.hasOwn;
        });

        test('returns true for own properties', () => {
            const obj = {key: 'value'};
            expect(hasOwn(obj, 'key')).toBe(true);
        });

        test('returns false for falsy own properties', () => {
            const obj = {key: false, key2: 0, key3: ''};
            expect(hasOwn(obj, 'key')).toBe(false);
            expect(hasOwn(obj, 'key2')).toBe(false);
            expect(hasOwn(obj, 'key3')).toBe(false);
        });

        test('returns false for properties inherited from the prototype', () => {
            const obj = {key: 'value'};
            expect(hasOwn(obj, '__proto__')).toBe(false);
            expect(hasOwn(obj, 'valueOf')).toBe(false);
        });

        test('returns true for own properties that have the same name as a property in the prototype', () => {
            const obj = JSON.parse('{"__proto__": 123, "valueOf": "123"}');
            expect(hasOwn(obj, '__proto__')).toBe(true);
            expect(hasOwn(obj, 'valueOf')).toBe(true);
        });
    });

    describe('compatibility tests', () => {
        beforeAll(() => {
            // clear require cache before running tests as the implementation of
            // hasOwn depends on whether Object.hasOwn is available
            jest.resetModules();
        });

        afterEach(() => {
            jest.resetModules();
        });

        test('works if Object.hasOwn does not exist', async () => {
            delete Object.hasOwn;
            expect(Object.hasOwn).toBeUndefined();

            const {hasOwn} = await import('./has_own');
            expect(typeof hasOwn).toBe('function');

            const testObject = {key: 'value'};
            expect(hasOwn(testObject, 'key')).toBe(true);
        });
    });
});

import {describe, test, expect, afterEach, vi, beforeAll} from 'vitest';

describe('get_own', () => {
    describe.each([
        [
            'when Object.hasOwn is available',
            function beforeAllFn() {
                // clear require cache before running tests as the implementation of
                // hasOwn depends on whether Object.hasOwn is available
                vi.resetModules();
                expect(Object.hasOwn).toBeInstanceOf(Function);
            }
        ],
        [
            'when Object.hasOwn is not available',
            function beforeAllFn() {
                vi.resetModules();
                delete Object.hasOwn;
                expect(Object.hasOwn).toBeUndefined();
            }
        ]
    ])('unit tests %s', (_, beforeAllFn) => {
        let getOwn: typeof import('./get_own').getOwn;

        beforeAll(async () => {
            beforeAllFn();

            const res = await import('./get_own');
            getOwn = res.getOwn;
        });

        afterEach(() => {
            vi.resetModules();
        });

        test('returns value for own properties', () => {
            const obj = {key: 'value'};
            expect(getOwn(obj, 'key')).toBe('value');
        });

        test('returns value for falsy own properties', () => {
            const obj = {key: false, key2: 0, key3: '', key4: undefined, key5: null};
            expect(getOwn(obj, 'key')).toBe(false);
            expect(getOwn(obj, 'key2')).toBe(0);
            expect(getOwn(obj, 'key3')).toBe('');
            expect(getOwn(obj, 'key4')).toBeUndefined();
            expect(getOwn(obj, 'key5')).toBeNull();
        });

        test('returns undefined for properties inherited from the prototype', () => {
            const obj = {key: 'value'};
            expect(getOwn(obj, '__proto__')).toBeUndefined();
            expect(getOwn(obj, 'constructor')).toBeUndefined();
            expect(getOwn(obj, 'valueOf')).toBeUndefined();

            const inheritedKey = 'inheritedKey';
            const prototype = {[inheritedKey]: 1234};
            const objWithPrototype = Object.create(prototype);
            expect(getOwn(objWithPrototype, inheritedKey)).toBeUndefined();
        });

        test('returns true for own properties that have the same name as a property in the prototype', () => {
            const obj = JSON.parse('{"__proto__": 123, "valueOf": "123"}');
            expect(getOwn(obj, '__proto__')).toBe(123);
            expect(getOwn(obj, 'valueOf')).toBe('123');
        });
    });
});

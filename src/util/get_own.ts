type HasOwnPropertyFn = <TObject extends object>(obj: TObject, key: PropertyKey) => key is keyof TObject;

// polyfill for Object.hasOwn
const hasOwnProperty: HasOwnPropertyFn =
    (Object.hasOwn as HasOwnPropertyFn) ||
    function hasOwnProperty<T extends object>(object: T, key: PropertyKey): key is keyof T {
        return Object.prototype.hasOwnProperty.call(object, key);
    };

export function getOwn<T extends object>(object: T, key: PropertyKey): T[keyof T] | undefined {
    return hasOwnProperty(object, key) ? object[key] : undefined;
}

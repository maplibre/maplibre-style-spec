export const hasOwn = Object.hasOwn || function hasOwn(object: object, key: PropertyKey): boolean {
    return Object.prototype.hasOwnProperty.call(object, key);
};

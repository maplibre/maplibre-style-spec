type Boxed = number | string | boolean;

/**
 * Checks whether a value is a boxed `Number`, `String` or `Boolean`, as created by jsonlint-lines-primitives.
 * `instanceof` on its own is not enough: given `{"__proto__": 1}` jsonlint creates an object that merely
 * inherits from a boxed primitive, on which e.g. `valueOf()` throws.
 * @param value - the value to check
 * @param constructor - the constructor of the boxed type to check for
 * @returns true if the value is a boxed primitive of the given type
 */
export function isBoxed(
    value: unknown,
    constructor: NumberConstructor | StringConstructor | BooleanConstructor
): boolean {
    if (!(value instanceof constructor)) return false;
    try {
        constructor.prototype.valueOf.call(value);
        return true;
    } catch {
        return false;
    }
}

// Turn jsonlint-lines-primitives objects into primitive objects
export function unbundle(value: unknown) {
    if (isBoxed(value, Number) || isBoxed(value, String) || isBoxed(value, Boolean)) {
        return (value as {valueOf(): Boxed}).valueOf();
    } else {
        return value;
    }
}

export function deepUnbundle(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(deepUnbundle);
    }

    const unbundled = unbundle(value);
    if (unbundled instanceof Object) {
        return Object.fromEntries(
            Object.entries(unbundled).map(([key, child]) => [key, deepUnbundle(child)])
        );
    }

    return unbundled;
}

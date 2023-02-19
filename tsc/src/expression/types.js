export const NullType = { kind: 'null' };
export const NumberType = { kind: 'number' };
export const StringType = { kind: 'string' };
export const BooleanType = { kind: 'boolean' };
export const ColorType = { kind: 'color' };
export const ObjectType = { kind: 'object' };
export const ValueType = { kind: 'value' };
export const ErrorType = { kind: 'error' };
export const CollatorType = { kind: 'collator' };
export const FormattedType = { kind: 'formatted' };
export const PaddingType = { kind: 'padding' };
export const ResolvedImageType = { kind: 'resolvedImage' };
export function array(itemType, N) {
    return {
        kind: 'array',
        itemType,
        N
    };
}
export function toString(type) {
    if (type.kind === 'array') {
        const itemType = toString(type.itemType);
        return typeof type.N === 'number' ?
            `array<${itemType}, ${type.N}>` :
            type.itemType.kind === 'value' ? 'array' : `array<${itemType}>`;
    }
    else {
        return type.kind;
    }
}
const valueMemberTypes = [
    NullType,
    NumberType,
    StringType,
    BooleanType,
    ColorType,
    FormattedType,
    ObjectType,
    array(ValueType),
    PaddingType,
    ResolvedImageType
];
/**
 * Returns null if `t` is a subtype of `expected`; otherwise returns an
 * error message.
 * @private
 */
export function checkSubtype(expected, t) {
    if (t.kind === 'error') {
        // Error is a subtype of every type
        return null;
    }
    else if (expected.kind === 'array') {
        if (t.kind === 'array' &&
            ((t.N === 0 && t.itemType.kind === 'value') || !checkSubtype(expected.itemType, t.itemType)) &&
            (typeof expected.N !== 'number' || expected.N === t.N)) {
            return null;
        }
    }
    else if (expected.kind === t.kind) {
        return null;
    }
    else if (expected.kind === 'value') {
        for (const memberType of valueMemberTypes) {
            if (!checkSubtype(memberType, t)) {
                return null;
            }
        }
    }
    return `Expected ${toString(expected)} but found ${toString(t)} instead.`;
}
export function isValidType(provided, allowedTypes) {
    return allowedTypes.some(t => t.kind === provided.kind);
}
export function isValidNativeType(provided, allowedTypes) {
    return allowedTypes.some(t => {
        if (t === 'null') {
            return provided === null;
        }
        else if (t === 'array') {
            return Array.isArray(provided);
        }
        else if (t === 'object') {
            return provided && !Array.isArray(provided) && typeof provided === 'object';
        }
        else {
            return t === typeof provided;
        }
    });
}
//# sourceMappingURL=types.js.map
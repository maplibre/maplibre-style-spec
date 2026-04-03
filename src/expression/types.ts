export type NullTypeT = {
    kind: 'null';
};
export type NumberTypeT = {
    kind: 'number';
};
export type StringTypeT = {
    kind: 'string';
};
export type BooleanTypeT = {
    kind: 'boolean';
};
export type ColorTypeT = {
    kind: 'color';
};
export type ProjectionDefinitionTypeT = {
    kind: 'projectionDefinition';
};
export type ObjectTypeT = {
    kind: 'object';
};
export type ValueTypeT = {
    kind: 'value';
};
export type ErrorTypeT = {
    kind: 'error';
};
export type CollatorTypeT = {
    kind: 'collator';
};
export type FormattedTypeT = {
    kind: 'formatted';
};
export type PaddingTypeT = {
    kind: 'padding';
};
export type NumberArrayTypeT = {
    kind: 'numberArray';
};
export type ColorArrayTypeT = {
    kind: 'colorArray';
};
export type ResolvedImageTypeT = {
    kind: 'resolvedImage';
};
export type VariableAnchorOffsetCollectionTypeT = {
    kind: 'variableAnchorOffsetCollection';
};

export type EvaluationKind = 'constant' | 'source' | 'camera' | 'composite';

export type Type =
    | NullTypeT
    | NumberTypeT
    | StringTypeT
    | BooleanTypeT
    | ColorTypeT
    | ProjectionDefinitionTypeT
    | ObjectTypeT
    | ValueTypeT
    | ArrayType
    | ErrorTypeT
    | CollatorTypeT
    | FormattedTypeT
    | PaddingTypeT
    | NumberArrayTypeT
    | ColorArrayTypeT
    | ResolvedImageTypeT
    | VariableAnchorOffsetCollectionTypeT;

export interface ArrayType<T extends Type = Type> {
    kind: 'array';
    itemType: T;
    N: number;
}

export type NativeType = 'number' | 'string' | 'boolean' | 'null' | 'array' | 'object';

export const NullType = {kind: 'null'} as NullTypeT;
export const NumberType = {kind: 'number'} as NumberTypeT;
export const StringType = {kind: 'string'} as StringTypeT;
export const BooleanType = {kind: 'boolean'} as BooleanTypeT;
export const ColorType = {kind: 'color'} as ColorTypeT;
export const ProjectionDefinitionType = {
    kind: 'projectionDefinition'
} as ProjectionDefinitionTypeT;
export const ObjectType = {kind: 'object'} as ObjectTypeT;
export const ValueType = {kind: 'value'} as ValueTypeT;
export const ErrorType = {kind: 'error'} as ErrorTypeT;
export const CollatorType = {kind: 'collator'} as CollatorTypeT;
export const FormattedType = {kind: 'formatted'} as FormattedTypeT;
export const PaddingType = {kind: 'padding'} as PaddingTypeT;
export const ColorArrayType = {kind: 'colorArray'} as ColorArrayTypeT;
export const NumberArrayType = {kind: 'numberArray'} as NumberArrayTypeT;
export const ResolvedImageType = {kind: 'resolvedImage'} as ResolvedImageTypeT;
export const VariableAnchorOffsetCollectionType = {
    kind: 'variableAnchorOffsetCollection'
} as VariableAnchorOffsetCollectionTypeT;

export function array<T extends Type>(itemType: T, N?: number | null): ArrayType<T> {
    return {
        kind: 'array',
        itemType,
        N
    };
}

export function typeToString(type: Type): string {
    if (type.kind === 'array') {
        const itemType = typeToString(type.itemType);
        return typeof type.N === 'number'
            ? `array<${itemType}, ${type.N}>`
            : type.itemType.kind === 'value'
              ? 'array'
              : `array<${itemType}>`;
    } else {
        return type.kind;
    }
}

const valueMemberTypes = [
    NullType,
    NumberType,
    StringType,
    BooleanType,
    ColorType,
    ProjectionDefinitionType,
    FormattedType,
    ObjectType,
    array(ValueType),
    PaddingType,
    NumberArrayType,
    ColorArrayType,
    ResolvedImageType,
    VariableAnchorOffsetCollectionType
];

/**
 * Returns null if `t` is a subtype of `expected`; otherwise returns an
 * error message.
 * @private
 */
export function checkSubtype(expected: Type, t: Type): string {
    if (t.kind === 'error') {
        // Error is a subtype of every type
        return null;
    } else if (expected.kind === 'array') {
        if (
            t.kind === 'array' &&
            ((t.N === 0 && t.itemType.kind === 'value') ||
                !checkSubtype(expected.itemType, t.itemType)) &&
            (typeof expected.N !== 'number' || expected.N === t.N)
        ) {
            return null;
        }
    } else if (expected.kind === t.kind) {
        return null;
    } else if (expected.kind === 'value') {
        for (const memberType of valueMemberTypes) {
            if (!checkSubtype(memberType, t)) {
                return null;
            }
        }
    }

    return `Expected ${typeToString(expected)} but found ${typeToString(t)} instead.`;
}

export function isValidType(provided: Type, allowedTypes: Array<Type>): boolean {
    return allowedTypes.some((t) => t.kind === provided.kind);
}

export function isValidNativeType(provided: any, allowedTypes: Array<NativeType>): boolean {
    return allowedTypes.some((t) => {
        if (t === 'null') {
            return provided === null;
        } else if (t === 'array') {
            return Array.isArray(provided);
        } else if (t === 'object') {
            return provided && !Array.isArray(provided) && typeof provided === 'object';
        } else {
            return t === typeof provided;
        }
    });
}

/**
 * Verify whether the specified type is of the same type as the specified sample.
 *
 * @param provided Type to verify
 * @param sample Sample type to reference
 * @returns `true` if both objects are of the same type, `false` otherwise
 * @example basic types
 * if (verifyType(outputType, ValueType)) {
 *     // type narrowed to:
 *     outputType.kind; // 'value'
 * }
 * @example array types
 * if (verifyType(outputType, array(NumberType))) {
 *     // type narrowed to:
 *     outputType.kind; // 'array'
 *     outputType.itemType; // NumberTypeT
 *     outputType.itemType.kind; // 'number'
 * }
 */
export function verifyType<T extends Type>(provided: Type, sample: T): provided is T {
    if (provided.kind === 'array' && sample.kind === 'array') {
        return provided.itemType.kind === sample.itemType.kind && typeof provided.N === 'number';
    }
    return provided.kind === sample.kind;
}

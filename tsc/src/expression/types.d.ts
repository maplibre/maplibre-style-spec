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
export type ResolvedImageTypeT = {
    kind: 'resolvedImage';
};
export type EvaluationKind = 'constant' | 'source' | 'camera' | 'composite';
export type Type = NullTypeT | NumberTypeT | StringTypeT | BooleanTypeT | ColorTypeT | ObjectTypeT | ValueTypeT | ArrayType | ErrorTypeT | CollatorTypeT | FormattedTypeT | PaddingTypeT | ResolvedImageTypeT;
export type ArrayType = {
    kind: 'array';
    itemType: Type;
    N: number;
};
export type NativeType = 'number' | 'string' | 'boolean' | 'null' | 'array' | 'object';
export declare const NullType: NullTypeT;
export declare const NumberType: NumberTypeT;
export declare const StringType: StringTypeT;
export declare const BooleanType: BooleanTypeT;
export declare const ColorType: ColorTypeT;
export declare const ObjectType: ObjectTypeT;
export declare const ValueType: ValueTypeT;
export declare const ErrorType: ErrorTypeT;
export declare const CollatorType: CollatorTypeT;
export declare const FormattedType: FormattedTypeT;
export declare const PaddingType: PaddingTypeT;
export declare const ResolvedImageType: ResolvedImageTypeT;
export declare function array(itemType: Type, N?: number | null): ArrayType;
export declare function toString(type: Type): string;
/**
 * Returns null if `t` is a subtype of `expected`; otherwise returns an
 * error message.
 * @private
 */
export declare function checkSubtype(expected: Type, t: Type): string;
export declare function isValidType(provided: Type, allowedTypes: Array<Type>): boolean;
export declare function isValidNativeType(provided: any, allowedTypes: Array<NativeType>): boolean;

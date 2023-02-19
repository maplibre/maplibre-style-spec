import Color from '../util/color';
import Collator from './types/collator';
import Formatted from './types/formatted';
import Padding from '../util/padding';
import ResolvedImage from './types/resolved_image';
import type { Type } from './types';
export declare function validateRGBA(r: unknown, g: unknown, b: unknown, a?: unknown): string | null;
export type Value = null | string | boolean | number | Color | Collator | Formatted | Padding | ResolvedImage | ReadonlyArray<Value> | {
    readonly [x: string]: Value;
};
export declare function isValue(mixed: unknown): boolean;
export declare function typeOf(value: Value): Type;
export declare function toString(value: Value): string;
export { Color, Collator, Padding };

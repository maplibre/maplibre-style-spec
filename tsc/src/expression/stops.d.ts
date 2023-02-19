import type { Expression } from './expression';
export type Stops = Array<[number, Expression]>;
/**
 * Returns the index of the last stop <= input, or 0 if it doesn't exist.
 * @private
 */
export declare function findStopLessThanOrEqualTo(stops: Array<number>, input: number): number;

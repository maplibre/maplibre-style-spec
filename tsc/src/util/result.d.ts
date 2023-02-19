/**
 * A type used for returning and propagating errors. The first element of the union
 * represents success and contains a value, and the second represents an error and
 * contains an error value.
 * @private
 */
export type Result<T, E> = {
    result: 'success';
    value: T;
} | {
    result: 'error';
    value: E;
};
export declare function success<T, E>(value: T): Result<T, E>;
export declare function error<T, E>(value: E): Result<T, E>;

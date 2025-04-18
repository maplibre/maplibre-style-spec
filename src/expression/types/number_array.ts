import {interpolateArray} from '../../util/interpolate-primitives';

/**
 * An array of numbers. Create instances from
 * bare arrays or numeric values using the static method `NumberArray.parse`.
 * @private
 */
export class NumberArray {
    values: number[];

    constructor(values: number[]) {
        this.values = values.slice();
    }

    /**
     * Numeric NumberArray values
     * @param input A NumberArray value
     * @returns A `NumberArray` instance, or `undefined` if the input is not a valid NumberArray value.
     */
    static parse(input?: number | number[] | NumberArray | null): NumberArray | undefined {
        if (input instanceof NumberArray) {
            return input;
        }

        // Backwards compatibility (e.g. hillshade-illumination-direction): bare number is treated the same as array with single value.
        if (typeof input === 'number') {
            return new NumberArray([input]);
        }

        if (!Array.isArray(input)) {
            return undefined;
        }

        for (const val of input) {
            if (typeof val !== 'number') {
                return undefined;
            }
        }

        return new NumberArray(input);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }

    static interpolate(from: NumberArray, to: NumberArray, t: number): NumberArray {
        return new NumberArray(interpolateArray(from.values, to.values, t));
    }
}

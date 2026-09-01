/**
 * Configuration for the vertical shading applied to the sides of a fill-extrusion layer.
 * Create instances from a boolean or a `[depth, referenceHeight]` array using the static
 * method `VerticalGradient.parse`.
 * @private
 */
export class VerticalGradient {
    /** How dark the foot of a wall gets, in the range [0, 1]. */
    depth: number;
    /** The building height, in meters, above which the shading reaches full `depth`; `0` shades every building equally. */
    referenceHeight: number;

    constructor(depth: number, referenceHeight: number) {
        this.depth = depth;
        this.referenceHeight = referenceHeight;
    }

    /**
     * @param input A vertical gradient value
     * @returns A `VerticalGradient` instance, or `undefined` if the input is not a valid vertical gradient value.
     */
    static parse(
        input?: boolean | number[] | VerticalGradient | null
    ): VerticalGradient | undefined {
        if (input instanceof VerticalGradient) {
            return input;
        }

        // Backwards compatibility: `true` matches the previously hardcoded shading,
        // `false` disables it.
        if (typeof input === 'boolean') {
            return input ? new VerticalGradient(0.5, 150) : new VerticalGradient(0, 0);
        }

        if (!Array.isArray(input) || input.length < 1 || input.length > 2) {
            return undefined;
        }

        for (const val of input) {
            if (typeof val !== 'number') {
                return undefined;
            }
        }

        return new VerticalGradient(input[0], input.length > 1 ? input[1] : 0);
    }

    toString(): string {
        return JSON.stringify([this.depth, this.referenceHeight]);
    }
}

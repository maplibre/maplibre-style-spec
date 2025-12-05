import {Color, InterpolationColorSpace} from './color';

/**
 * An array of colors. Create instances from
 * bare arrays or strings using the static method `ColorArray.parse`.
 * @private
 */
export class ColorArray {
    values: Color[];

    constructor(values: Color[]) {
        this.values = values.slice();
    }

    /**
     * ColorArray values
     * @param input A ColorArray value
     * @returns A `ColorArray` instance, or `undefined` if the input is not a valid ColorArray value.
     */
    static parse(input?: string | string[] | ColorArray | null): ColorArray | undefined {
        if (input instanceof ColorArray) {
            return input;
        }

        // Backwards compatibility (e.g. hillshade-shadow-color): bare Color is treated the same as array with single value.
        if (typeof input === 'string') {
            const parsed_val = Color.parse(input);
            if (!parsed_val) {
                return undefined;
            }
            return new ColorArray([parsed_val]);
        }

        if (!Array.isArray(input)) {
            return undefined;
        }

        const colors: Color[] = [];

        for (const val of input) {
            if (typeof val !== 'string') {
                return undefined;
            }
            const parsed_val = Color.parse(val);
            if (!parsed_val) {
                return undefined;
            }
            colors.push(parsed_val);
        }

        return new ColorArray(colors);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }

    static interpolate(
        from: ColorArray,
        to: ColorArray,
        t: number,
        spaceKey: InterpolationColorSpace = 'rgb'
    ): ColorArray {
        const colors = [] as Color[];
        if (from.values.length != to.values.length) {
            throw new Error(
                `colorArray: Arrays have mismatched length (${from.values.length} vs. ${to.values.length}), cannot interpolate.`
            );
        }
        for (let i = 0; i < from.values.length; i++) {
            colors.push(Color.interpolate(from.values[i], to.values[i], t, spaceKey));
        }
        return new ColorArray(colors);
    }
}

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

        // Backwards compatibility: bare Color is treated the same as array with single value.
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

        const c = [] as Color[];

        for (const val of input) {
            if (typeof val !== 'string') {
                return undefined;
            }
            const parsed_val = Color.parse(val);
            if(!parsed_val) {
                return undefined;
            }
            c.push(parsed_val);
        }

        return new ColorArray(c);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }

    static interpolate(from: ColorArray, to: ColorArray, t: number, spaceKey: InterpolationColorSpace = 'rgb'): ColorArray {
        const  c = [] as Color[];
        for(let i = 0; i < from.values.length; i++) {
            c.push(Color.interpolate(from.values[i], to.values[i], t, spaceKey))
        }
        return new ColorArray(c);
    }
}

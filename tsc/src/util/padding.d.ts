/**
 * A set of four numbers representing padding around a box. Create instances from
 * bare arrays or numeric values using the static method `Padding.parse`.
 * @private
 */
declare class Padding {
    /** Padding values are in CSS order: top, right, bottom, left */
    values: [number, number, number, number];
    constructor(values: [number, number, number, number]);
    /**
     * Numeric padding values
     * @returns A `Padding` instance, or `undefined` if the input is not a valid padding value.
     */
    static parse(input?: number | number[] | Padding | null): Padding | void;
    toString(): string;
}
export default Padding;

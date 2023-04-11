/**
 * Collection of one or more offset values.
 * @private
 */
class OffsetCollection {
    values: Array<[number, number]>;

    constructor(values: Array<[number, number]>) {
        this.values = JSON.parse(JSON.stringify(values));
    }

    static parse(input?: OffsetCollection | [number, number] | Array<[number, number]> | null): OffsetCollection | void {
        if (input instanceof OffsetCollection) {
            return input;
        }

        if (!Array.isArray(input) || input.length < 1) {
            return undefined;
        }

        if (input.length === 2 && typeof input[0] === 'number' && typeof input[1] === 'number') {
            input = [input as [number, number]] ;
        }

        const inputCollection = input as Array<[number, number]>;

        for (const offset of inputCollection) {
            if (offset?.length !== 2 || typeof offset[0] !== 'number' || typeof offset[1] !== 'number') {
                return undefined;
            }
        }

        return new OffsetCollection(inputCollection);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }
}

export default OffsetCollection;
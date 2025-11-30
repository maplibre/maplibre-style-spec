import {RuntimeError} from '../runtime_error';
import {interpolateNumber} from '../../util/interpolate-primitives';
import type {VariableAnchorOffsetCollectionSpecification} from '../../types.g';

/** Set of valid anchor positions, as a set for validation */
const anchors = new Set([
    'center',
    'left',
    'right',
    'top',
    'bottom',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right'
]);

/**
 * Utility class to assist managing values for text-variable-anchor-offset property. Create instances from
 * bare arrays using the static method `VariableAnchorOffsetCollection.parse`.
 * @private
 */
export class VariableAnchorOffsetCollection {
    /** Series of paired of anchor (string) and offset (point) values */
    values: VariableAnchorOffsetCollectionSpecification;

    constructor(values: VariableAnchorOffsetCollectionSpecification) {
        this.values = values.slice();
    }

    static parse(
        input?: VariableAnchorOffsetCollectionSpecification | VariableAnchorOffsetCollection
    ): VariableAnchorOffsetCollection | undefined {
        if (input instanceof VariableAnchorOffsetCollection) {
            return input;
        }

        if (!Array.isArray(input) || input.length < 1 || input.length % 2 !== 0) {
            return undefined;
        }

        for (let i = 0; i < input.length; i += 2) {
            // Elements in even positions should be anchor positions; Elements in odd positions should be offset values
            const anchorValue = input[i];
            const offsetValue = input[i + 1];

            if (typeof anchorValue !== 'string' || !anchors.has(anchorValue)) {
                return undefined;
            }

            if (
                !Array.isArray(offsetValue) ||
                offsetValue.length !== 2 ||
                typeof offsetValue[0] !== 'number' ||
                typeof offsetValue[1] !== 'number'
            ) {
                return undefined;
            }
        }

        return new VariableAnchorOffsetCollection(input);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }

    static interpolate(
        from: VariableAnchorOffsetCollection,
        to: VariableAnchorOffsetCollection,
        t: number
    ): VariableAnchorOffsetCollection {
        const fromValues = from.values;
        const toValues = to.values;

        if (fromValues.length !== toValues.length) {
            throw new RuntimeError(
                `Cannot interpolate values of different length. from: ${from.toString()}, to: ${to.toString()}`
            );
        }

        const output: VariableAnchorOffsetCollectionSpecification = [];

        for (let i = 0; i < fromValues.length; i += 2) {
            // Anchor entries must match
            if (fromValues[i] !== toValues[i]) {
                throw new RuntimeError(
                    `Cannot interpolate values containing mismatched anchors. from[${i}]: ${fromValues[i]}, to[${i}]: ${toValues[i]}`
                );
            }
            output.push(fromValues[i]);

            // Interpolate the offset values for each anchor
            const [fx, fy] = fromValues[i + 1] as [number, number];
            const [tx, ty] = toValues[i + 1] as [number, number];
            output.push([interpolateNumber(fx, tx, t), interpolateNumber(fy, ty, t)]);
        }

        return new VariableAnchorOffsetCollection(output);
    }
}

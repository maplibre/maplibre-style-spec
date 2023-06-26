import {VariableAnchorOffsetCollectionSpecification} from '../types.g';

/** Set of valid anchor positions, as a set for validation */
const anchors = new Set(['center', 'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']);

/**
 * Utility class to assist managing values for text-variable-anchor-offset property. Create instances from
 * bare arrays using the static method `VariableAnchorOffsetCollection.parse`.
 * @private
 */
class VariableAnchorOffsetCollection {
    /** Series of paired of anchor (string) and offset (point) values */
    values: VariableAnchorOffsetCollectionSpecification;

    constructor(values: VariableAnchorOffsetCollectionSpecification) {
        this.values = values.slice();
    }

    static parse(input?: VariableAnchorOffsetCollectionSpecification | VariableAnchorOffsetCollection): VariableAnchorOffsetCollection | undefined {
        if (input instanceof VariableAnchorOffsetCollection) {
            return input;
        }

        if (!Array.isArray(input) ||
            input.length < 1 ||
            input.length % 2 !== 0) {
            return undefined;
        }

        for (let i = 0; i < input.length; i += 2) {
            // Elements in even positions should be anchor positions; Elements in odd positions should be offset values
            const anchorValue = input[i];
            const offsetValue = input[i + 1];

            if (typeof anchorValue !== 'string' || !anchors.has(anchorValue)) {
                return undefined;
            }

            if (!Array.isArray(offsetValue) || offsetValue.length !== 2 || typeof offsetValue[0] !== 'number' || typeof offsetValue[1] !== 'number') {
                return undefined;
            }
        }

        return new VariableAnchorOffsetCollection(input);
    }

    toString(): string {
        return JSON.stringify(this.values);
    }
}

export default VariableAnchorOffsetCollection;

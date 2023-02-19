import type { GlobalProperties, Feature } from '../expression';
import { ICanonicalTileID } from '../tiles_and_coordinates';
import { ExpressionFilterSpecification } from '../types.g';
type FilterExpression = (globalProperties: GlobalProperties, feature: Feature, canonical?: ICanonicalTileID) => boolean;
export type FeatureFilter = {
    filter: FilterExpression;
    needGeometry: boolean;
};
export default createFilter;
export { isExpressionFilter };
declare function isExpressionFilter(filter: any): filter is ExpressionFilterSpecification;
/**
 * Given a filter expressed as nested arrays, return a new function
 * that evaluates whether a given feature (with a .properties or .tags property)
 * passes its test.
 *
 * @private
 * @param {Array} filter maplibre gl filter
 * @returns {Function} filter-evaluating function
 */
declare function createFilter(filter: any): FeatureFilter;

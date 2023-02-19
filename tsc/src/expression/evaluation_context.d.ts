import { Color } from './values';
import type { FormattedSection } from './types/formatted';
import type { GlobalProperties, Feature, FeatureState } from './index';
import { ICanonicalTileID } from '../tiles_and_coordinates';
declare class EvaluationContext {
    globals: GlobalProperties;
    feature: Feature;
    featureState: FeatureState;
    formattedSection: FormattedSection;
    availableImages: Array<string>;
    canonical: ICanonicalTileID;
    _parseColorCache: {
        [_: string]: Color;
    };
    constructor();
    id(): any;
    geometryType(): string;
    geometry(): import("@mapbox/point-geometry")[][];
    canonicalID(): ICanonicalTileID;
    properties(): {
        [_: string]: any;
    };
    parseColor(input: string): Color;
}
export default EvaluationContext;

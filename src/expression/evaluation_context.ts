import type {FormattedSection} from './types/formatted';
import type {GlobalProperties, Feature, FeatureState} from './index';
import {ICanonicalTileID} from '../tiles_and_coordinates';
import {Color} from './types/color';

const geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];

export class EvaluationContext {
    globals: GlobalProperties;
    feature: Feature;
    featureState: FeatureState;
    formattedSection: FormattedSection;
    availableImages: Array<string>;
    canonical: ICanonicalTileID;

    _parseColorCache: Map<string, Color>;

    constructor() {
        this.globals = null;
        this.feature = null;
        this.featureState = null;
        this.formattedSection = null;
        this._parseColorCache = new Map<string, Color>();
        this.availableImages = null;
        this.canonical = null;
    }

    id() {
        return this.feature && 'id' in this.feature ? this.feature.id : null;
    }

    geometryType() {
        return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
    }

    geometry() {
        return this.feature && 'geometry' in this.feature ? this.feature.geometry : null;
    }

    canonicalID() {
        return this.canonical;
    }

    properties() {
        return this.feature && this.feature.properties || {};
    }

    parseColor(input: string): Color {
        let cached = this._parseColorCache.get(input);
        if (!cached) {
            cached = Color.parse(input);
            this._parseColorCache.set(input, cached);
        }
        return cached;
    }
}


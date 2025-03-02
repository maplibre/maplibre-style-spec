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

    _parseColorCache: {[_: string]: Color};

    constructor() {
        this.globals = null;
        this.feature = null;
        this.featureState = null;
        this.formattedSection = null;
        // the cache keys are user controlled (from the source JSON), so
        // avoid prototype pollution by creating a record with a null prototype
        this._parseColorCache = Object.create(null) as {[_: string]: Color};
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
        let cached = this._parseColorCache[input];
        if (!cached) {
            cached = this._parseColorCache[input] = Color.parse(input);
        }
        return cached;
    }
}


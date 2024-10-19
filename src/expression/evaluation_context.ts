import {Color} from './values';
import type {FormattedSection} from './types/formatted';
import type {GlobalProperties, Feature, FeatureState} from './index';
import {ICanonicalTileID} from '../tiles_and_coordinates';
import {hasMultipleOuterRings} from '../util/classify_rings';

const geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];
const simpleGeometryType = {
    'Unknown': 'Unknown',
    'Point': 'Point',
    'MultiPoint': 'Point',
    'LineString': 'LineString',
    'MultiLineString': 'LineString',
    'Polygon': 'Polygon',
    'MultiPolygon': 'Polygon'
};

class EvaluationContext {
    globals: GlobalProperties;
    feature: Feature;
    featureState: FeatureState;
    formattedSection: FormattedSection;
    availableImages: Array<string>;
    canonical: ICanonicalTileID;

    _parseColorCache: {[_: string]: Color};
    _geometryType: string;

    constructor() {
        this.globals = null;
        this.feature = null;
        this.featureState = null;
        this.formattedSection = null;
        this._parseColorCache = {};
        this.availableImages = null;
        this.canonical = null;
    }

    id() {
        return this.feature && 'id' in this.feature ? this.feature.id : null;
    }

    geometryDollarType() {
        return this.feature ?
            typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : simpleGeometryType[this.feature.type] :
            null;
    }

    geometryType() {
        let geometryType = this.feature.type;
        if (typeof geometryType !== 'number') {
            return geometryType;
        }
        geometryType = geometryTypes[this.feature.type];
        if (geometryType === 'Unknown') {
            return geometryType;
        }
        const geom = this.geometry();
        const len = geom.length;
        if (len === 1) {
            return geometryType;
        }
        if (geometryType !== 'Polygon') {
            return `Multi${geometryType}`;
        }
        if (hasMultipleOuterRings(geom)) {
            return 'MultiPolygon';
        }
        return 'Polygon';
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
            cached = this._parseColorCache[input] = Color.parse(input) as Color;
        }
        return cached;
    }
}

export default EvaluationContext;

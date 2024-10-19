import {Color} from './values';
import type {FormattedSection} from './types/formatted';
import type {GlobalProperties, Feature, FeatureState} from './index';
import {ICanonicalTileID} from '../tiles_and_coordinates';
import {calculateSignedArea} from '../util/classify_rings';

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
        // Following https://github.com/mapbox/vector-tile-js/blob/77851380b63b07fd0af3d5a3f144cc86fb39fdd1/lib/vectortilefeature.js#L197
        for (let i = 0, ccw; i < len; i++) {
            const area = calculateSignedArea(geom[i]);
            if (area === 0) continue;
            if (ccw === undefined) {
                ccw = area < 0;
            } else if (ccw === area < 0) {
                // Same direction as the first ring -> a second outer ring
                return 'MultiPolygon';
            }
        }
        return geometryType;
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

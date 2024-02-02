import {Color} from './values';
import type {FormattedSection} from './types/formatted';
import type {GlobalProperties, Feature, FeatureState} from './index';
import {ICanonicalTileID} from '../tiles_and_coordinates';

const geometryTypes = ['Unknown', 'Point', 'LineString', 'Polygon'];

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
        this._geometryType = null;
    }

    id() {
        return this.feature && 'id' in this.feature ? this.feature.id : null;
    }

    // Bluntly copied from
    // https://github.com/mapbox/vector-tile-js/blob/77851380b63b07fd0af3d5a3f144cc86fb39fdd1/lib/vectortilefeature.js#L225-L233
    _signedArea(ring) {
        var sum = 0;
        for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
            p1 = ring[i];
            p2 = ring[j];
            sum += (p2.x - p1.x) * (p1.y + p2.y);
        }
        return sum;
    }

    geometryDollarType() {
        return this.feature ? typeof this.feature.type === 'number' ? geometryTypes[this.feature.type] : this.feature.type : null;
    }

    geometryType() {
        if (! this._geometryType) {
            if (typeof this.feature.type === 'number') {
                this._geometryType = geometryTypes[this.feature.type];
                if (this._geometryType !== 'Unknown') {
                    // TODO Can geom be a constant/readonly?
                    var geom = this.geometry();
                    if (! geom) {
                        // TODO This is an ilegal feature
                        this._geometryType = 'Unknown';
                    } else {
                        var len = geom.length;
                        if (len > 1) {
                            switch (this._geometryType) {
                                case 'Point':
                                    this._geometryType = 'MultiPoint';
                                    break;
                                case 'LineString':
                                    this._geometryType = 'MultiLineString';
                                    break;
                                case 'Polygon' :
                                    // Following https://github.com/mapbox/vector-tile-js/blob/77851380b63b07fd0af3d5a3f144cc86fb39fdd1/lib/vectortilefeature.js#L197
                                    var ccw;
                                    for (var i = 0; i < len; i++) {
                                        var area = this._signedArea(geom[i]);
                                        if (area === 0) continue;
                                        if (ccw === undefined) {
                                            ccw = area < 0;
                                        } else if (ccw === area < 0) {
                                            this._geometryType = 'MultiPolygon';
                                            break;
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            } else {
                this._geometryType = this.feature.type;
            }
        };
        return this._geometryType;
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

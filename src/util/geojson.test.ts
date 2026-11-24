import {describe, expect, test} from 'vitest';
import {getSimpleGeometries, isSimpleGeometry} from './geojson';

const point = {type: 'Point', coordinates: [1, 2]};
const geometryCollection = {type: 'GeometryCollection', geometries: []};

describe('isSimpleGeometry', () => {
    test('accepts coordinates nested at the depth of each geometry type', () => {
        const position = [1, 2];
        const line = [position, position];
        expect(isSimpleGeometry({type: 'Point', coordinates: position})).toBe(true);
        expect(isSimpleGeometry({type: 'MultiPoint', coordinates: line})).toBe(true);
        expect(isSimpleGeometry({type: 'LineString', coordinates: line})).toBe(true);
        expect(isSimpleGeometry({type: 'MultiLineString', coordinates: [line]})).toBe(true);
        expect(isSimpleGeometry({type: 'Polygon', coordinates: [line]})).toBe(true);
        expect(isSimpleGeometry({type: 'MultiPolygon', coordinates: [[line]]})).toBe(true);
    });

    test('rejects malformed coordinates', () => {
        expect(isSimpleGeometry({type: 'Polygon', coordinates: null})).toBe(false);
        expect(isSimpleGeometry({type: 'Polygon', coordinates: [[1, 2]]})).toBe(false);
        expect(isSimpleGeometry({type: 'Point', coordinates: [1]})).toBe(false);
        expect(isSimpleGeometry({type: 'Point', coordinates: ['a', 'b']})).toBe(false);
    });

    test('rejects values which are not geometries', () => {
        expect(isSimpleGeometry(null)).toBe(false);
        expect(isSimpleGeometry({})).toBe(false);
        expect(isSimpleGeometry({type: 'constructor', coordinates: []})).toBe(false);
    });
});

describe('getSimpleGeometries', () => {
    test('extracts geometries, skipping unlocated features and geometry collections', () => {
        const features = [point, null, geometryCollection].map((geometry) => ({geometry}));
        expect(getSimpleGeometries({type: 'FeatureCollection', features})).toEqual([point]);
        expect(getSimpleGeometries({type: 'Feature', geometry: point})).toEqual([point]);
        expect(getSimpleGeometries(point)).toEqual([point]);
    });

    test('returns null for malformed GeoJSON', () => {
        expect(getSimpleGeometries(null)).toBeNull();
        expect(getSimpleGeometries({type: 'FeatureCollection'})).toBeNull();
        expect(getSimpleGeometries({type: 'FeatureCollection', features: [null]})).toBeNull();
        expect(getSimpleGeometries({type: 'Feature', geometry: null})).toBeNull();
        expect(getSimpleGeometries(geometryCollection)).toBeNull();
    });
});

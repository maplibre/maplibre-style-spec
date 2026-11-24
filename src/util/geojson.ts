/**
 * How deep positions are nested in the `coordinates` of each geometry type.
 */
const COORDINATES_DEPTH = {
    Point: 0,
    MultiPoint: 1,
    LineString: 1,
    MultiLineString: 2,
    Polygon: 2,
    MultiPolygon: 3
} satisfies Record<SimpleGeoJSONGeometry['type'], number>;

/**
 * A GeoJSON geometry that has `coordinates`.
 */
export type SimpleGeoJSONGeometry = Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>;

function areValidCoordinates(coordinates: unknown, depth: number): boolean {
    if (!Array.isArray(coordinates)) return false;
    if (depth === 0) {
        return coordinates.length >= 2 && coordinates.every((c) => typeof c === 'number');
    }
    return coordinates.every((c) => areValidCoordinates(c, depth - 1));
}

/**
 * Checks that an untrusted value is a geometry whose `coordinates` have the structure its `type` requires.
 * @param geometry - the value to check
 * @returns true if the value is a well-formed geometry. Geometry collections are not supported.
 */
export function isSimpleGeometry(geometry: unknown): geometry is SimpleGeoJSONGeometry {
    if (typeof geometry !== 'object' || geometry === null) return false;
    const {type, coordinates} = geometry as {type: unknown; coordinates: unknown};
    return (
        typeof type === 'string' &&
        Object.keys(COORDINATES_DEPTH).includes(type) &&
        areValidCoordinates(coordinates, COORDINATES_DEPTH[type])
    );
}

/**
 * Extracts the geometries of an untrusted value that is expected to be GeoJSON.
 * Unlocated features (having a `null` geometry) and geometry collections are skipped.
 * @param geojson - the value to extract geometries from
 * @returns the geometries, or null if the value isn't well-formed GeoJSON
 */
export function getSimpleGeometries(geojson: unknown): SimpleGeoJSONGeometry[] | null {
    if (typeof geojson !== 'object' || geojson === null) return null;

    const {type, geometry, features} = geojson as Record<string, unknown>;

    let candidates: unknown[];
    if (type === 'FeatureCollection') {
        if (!Array.isArray(features)) return null;
        candidates = [];
        for (const feature of features) {
            if (typeof feature !== 'object' || feature === null) return null;
            if (feature.geometry !== null) candidates.push(feature.geometry);
        }
    } else if (type === 'Feature') {
        candidates = [geometry];
    } else {
        // a bare geometry collection is not supported
        return isSimpleGeometry(geojson) ? [geojson] : null;
    }

    const geometries: SimpleGeoJSONGeometry[] = [];
    for (const candidate of candidates) {
        if (isSimpleGeometry(candidate)) {
            geometries.push(candidate);
        } else if (
            (candidate as GeoJSON.Geometry | null | undefined)?.type !== 'GeometryCollection'
        ) {
            return null;
        }
    }
    return geometries;
}

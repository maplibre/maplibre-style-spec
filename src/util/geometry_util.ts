import {ICanonicalTileID} from '../tiles_and_coordinates';

// minX, minY, maxX, maxY
export type BBox = [number, number, number, number];

export const EXTENT = 8192;

export function getTileCoordinates(p: GeoJSON.Position, canonical: ICanonicalTileID): [number, number] {
    const x = mercatorXfromLng(p[0]);
    const y = mercatorYfromLat(p[1]);
    const tilesAtZoom = Math.pow(2, canonical.z);
    return [Math.round(x * tilesAtZoom * EXTENT), Math.round(y * tilesAtZoom * EXTENT)];
}

export function getLngLatFromTileCoord(coord: [number, number], canonical: ICanonicalTileID): GeoJSON.Position {
    const tilesAtZoom = Math.pow(2, canonical.z);
    const x = (coord[0] / EXTENT + canonical.x) / tilesAtZoom;
    const y = (coord[1] / EXTENT + canonical.y) / tilesAtZoom;
    return [lngFromMercatorXfromLng(x), latFromMercatorY(y)];
}

function mercatorXfromLng(lng: number) {
    return (180 + lng) / 360;
}

function lngFromMercatorXfromLng(mercatorX: number) {
    return mercatorX * 360 - 180;
}

function mercatorYfromLat(lat: number) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

function latFromMercatorY(mercatorY: number) {
    return 360 / Math.PI * Math.atan(Math.exp((180 - mercatorY * 360) * Math.PI / 180)) - 90;
}

export function updateBBox(bbox: BBox, coord: GeoJSON.Position) {
    bbox[0] = Math.min(bbox[0], coord[0]);
    bbox[1] = Math.min(bbox[1], coord[1]);
    bbox[2] = Math.max(bbox[2], coord[0]);
    bbox[3] = Math.max(bbox[3], coord[1]);
}

export function boxWithinBox(bbox1: BBox, bbox2: BBox) {
    if (bbox1[0] <= bbox2[0]) return false;
    if (bbox1[2] >= bbox2[2]) return false;
    if (bbox1[1] <= bbox2[1]) return false;
    if (bbox1[3] >= bbox2[3]) return false;
    return true;
}

export function rayIntersect(p: [number, number], p1: [number, number], p2: [number, number]): boolean {
    return ((p1[1] > p[1]) !== (p2[1] > p[1])) && (p[0] < (p2[0] - p1[0]) * (p[1] - p1[1]) / (p2[1] - p1[1]) + p1[0]);
}

function pointOnBoundary(p: [number, number], p1: [number, number], p2: [number, number]): boolean {
    const x1 = p[0] - p1[0];
    const y1 = p[1] - p1[1];
    const x2 = p[0] - p2[0];
    const y2 = p[1] - p2[1];
    return (x1 * y2 - x2 * y1 === 0) && (x1 * x2 <= 0) && (y1 * y2 <= 0);
}

// a, b are end points for line segment1, c and d are end points for line segment2
export function segmentIntersectSegment(a: [number, number], b: [number, number], c: [number, number], d: [number, number]) {
    // check if two segments are parallel or not
    // precondition is end point a, b is inside polygon, if line a->b is
    // parallel to polygon edge c->d, then a->b won't intersect with c->d
    const vectorP: [number, number] = [b[0] - a[0], b[1] - a[1]];
    const vectorQ: [number, number] = [d[0] - c[0], d[1] - c[1]];
    if (perp(vectorQ, vectorP) === 0) return false;

    // If lines are intersecting with each other, the relative location should be:
    // a and b lie in different sides of segment c->d
    // c and d lie in different sides of segment a->b
    if (twoSided(a, b, c, d) && twoSided(c, d, a, b)) return true;
    return false;
}

export function lineIntersectPolygon(p1, p2, polygon) {
    for (const ring of polygon) {
        // loop through every edge of the ring
        for (let j = 0; j < ring.length - 1; ++j) {
            if (segmentIntersectSegment(p1, p2, ring[j], ring[j + 1])) {
                return true;
            }
        }
    }
    return false;
}

// ray casting algorithm for detecting if point is in polygon
export function pointWithinPolygon(point: [number, number], rings: [number, number][][], trueIfOnBoundary = false) {
    let inside = false;
    for (const ring of rings) {
        for (let j = 0; j < ring.length - 1; j++) {
            if (pointOnBoundary(point, ring[j], ring[j + 1])) return trueIfOnBoundary;
            if (rayIntersect(point, ring[j], ring[j + 1])) inside = !inside;
        }
    }
    return inside;
}

export function pointWithinPolygons(point: [number, number], polygons: [number, number][][][]) {
    for (const polygon of polygons) {
        if (pointWithinPolygon(point, polygon)) return true;
    }
    return false;
}

export function lineStringWithinPolygon(line: [number, number][], polygon: [number, number][][]) {
    // First, check if geometry points of line segments are all inside polygon
    for (const point of line) {
        if (!pointWithinPolygon(point, polygon)) {
            return false;
        }
    }

    // Second, check if there is line segment intersecting polygon edge
    for (let i = 0; i < line.length - 1; ++i) {
        if (lineIntersectPolygon(line[i], line[i + 1], polygon)) {
            return false;
        }
    }
    return true;
}

export function lineStringWithinPolygons(line: [number, number][], polygons: [number, number][][][]) {
    for (const polygon of polygons) {
        if (lineStringWithinPolygon(line, polygon)) return true;
    }
    return false;
}

function perp(v1: [number, number], v2: [number, number]) {
    return (v1[0] * v2[1] - v1[1] * v2[0]);
}

// check if p1 and p2 are in different sides of line segment q1->q2
function  twoSided(p1: [number, number], p2: [number, number], q1: [number, number], q2: [number, number]) {
    // q1->p1 (x1, y1), q1->p2 (x2, y2), q1->q2 (x3, y3)
    const x1 = p1[0] - q1[0];
    const y1 = p1[1] - q1[1];
    const x2 = p2[0] - q1[0];
    const y2 = p2[1] - q1[1];
    const x3 = q2[0] - q1[0];
    const y3 = q2[1] - q1[1];
    const det1 = (x1 * y3 - x3 * y1);
    const det2 =  (x2 * y3 - x3 * y2);
    if ((det1 > 0 && det2 < 0) || (det1 < 0 && det2 > 0)) return true;
    return false;
}

import quickselect from 'quickselect';
import {Point2D} from '../point2d';

export type RingWithArea<T extends Point2D> = T[] & { area?: number };

/**
 * Classifies an array of rings into polygons with outer rings and holes
 * @param rings - the rings to classify
 * @param maxRings - the maximum number of rings to include in a polygon, use 0 to include all rings
 * @returns an array of polygons with internal rings as holes
 */
export function classifyRings<T extends Point2D>(rings: RingWithArea<T>[], maxRings?: number): RingWithArea<T>[][] {
    const len = rings.length;

    if (len <= 1) return [rings];

    const polygons: RingWithArea<T>[][] = [];
    let polygon: RingWithArea<T>[];
    let ccw: boolean | undefined;

    for (const ring of rings) {
        const area = calculateSignedArea(ring);
        if (area === 0) continue;

        ring.area = Math.abs(area);

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [ring];
        } else {
            polygon.push(ring);
        }
    }
    if (polygon) polygons.push(polygon);

    // Earcut performance degrades with the # of rings in a polygon. For this
    // reason, we limit strip out all but the `maxRings` largest rings.
    if (maxRings > 1) {
        for (let j = 0; j < polygons.length; j++) {
            if (polygons[j].length <= maxRings) continue;
            quickselect(polygons[j], maxRings, 1, polygons[j].length - 1, compareAreas);
            polygons[j] = polygons[j].slice(0, maxRings);
        }
    }

    return polygons;
}

function compareAreas<T extends Point2D>(a: RingWithArea<T>, b: RingWithArea<T>): number {
    return b.area - a.area;
}

/**
 * Returns the signed area for the polygon ring.  Positive areas are exterior rings and
 * have a clockwise winding.  Negative areas are interior rings and have a counter clockwise
 * ordering.
 *
 * @param ring - Exterior or interior ring
 * @returns Signed area
 */
function calculateSignedArea(ring: Point2D[]): number {
    let sum = 0;
    for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

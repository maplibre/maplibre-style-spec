import TinyQueue from 'tinyqueue';
import {Expression} from '../expression';
import {ParsingContext} from '../parsing_context';
import {NumberType, Type} from '../types';
import {isValue} from '../values';
import {EvaluationContext} from '../evaluation_context';
import {
    BBox,
    boxWithinBox,
    getLngLatFromTileCoord,
    pointWithinPolygon,
    segmentIntersectSegment,
    updateBBox
} from '../../util/geometry_util';
import {classifyRings} from '../../util/classify_rings';
import {CheapRuler} from '../../util/cheap_ruler';

type SimpleGeometry = GeoJSON.Polygon | GeoJSON.LineString | GeoJSON.Point;

const MinPointsSize = 100;
const MinLinePointsSize = 50;

type IndexRange = [number, number];
type DistPair = [number, IndexRange, IndexRange];

function compareDistPair(a: DistPair, b: DistPair): number {
    return b[0] - a[0];
}

function getRangeSize(range: IndexRange) {
    return range[1] - range[0] + 1;
}

function isRangeSafe(range: IndexRange, threshold: number): boolean {
    return range[1] >= range[0] && range[1] < threshold;
}

function splitRange(range: IndexRange, isLine: boolean): [IndexRange, IndexRange] {
    if (range[0] > range[1]) {
        return [null, null];
    }
    const size = getRangeSize(range);
    if (isLine) {
        if (size === 2) {
            return [range, null];
        }
        const size1 = Math.floor(size / 2);
        return [
            [range[0], range[0] + size1],
            [range[0] + size1, range[1]]
        ];
    }
    if (size === 1) {
        return [range, null];
    }
    const size1 = Math.floor(size / 2) - 1;
    return [
        [range[0], range[0] + size1],
        [range[0] + size1 + 1, range[1]]
    ];
}

function getBBox(coords: [number, number][], range: IndexRange): BBox {
    if (!isRangeSafe(range, coords.length)) {
        return [Infinity, Infinity, -Infinity, -Infinity];
    }

    const bbox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
    for (let i = range[0]; i <= range[1]; ++i) {
        updateBBox(bbox, coords[i]);
    }
    return bbox;
}

function getPolygonBBox(polygon: [number, number][][]): BBox {
    const bbox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
    for (const ring of polygon) {
        for (const coord of ring) {
            updateBBox(bbox, coord);
        }
    }
    return bbox;
}

function isValidBBox(bbox: BBox): boolean {
    return (
        bbox[0] !== -Infinity &&
        bbox[1] !== -Infinity &&
        bbox[2] !== Infinity &&
        bbox[3] !== Infinity
    );
}

// Calculate the distance between two bounding boxes.
// Calculate the delta in x and y direction, and use two fake points {0.0, 0.0}
// and {dx, dy} to calculate the distance. Distance will be 0.0 if bounding box are overlapping.
function bboxToBBoxDistance(bbox1: BBox, bbox2: BBox, ruler: CheapRuler): number {
    if (!isValidBBox(bbox1) || !isValidBBox(bbox2)) {
        return NaN;
    }
    let dx = 0.0;
    let dy = 0.0;
    // bbox1 in left side
    if (bbox1[2] < bbox2[0]) {
        dx = bbox2[0] - bbox1[2];
    }
    // bbox1 in right side
    if (bbox1[0] > bbox2[2]) {
        dx = bbox1[0] - bbox2[2];
    }
    // bbox1 in above side
    if (bbox1[1] > bbox2[3]) {
        dy = bbox1[1] - bbox2[3];
    }
    // bbox1 in down side
    if (bbox1[3] < bbox2[1]) {
        dy = bbox2[1] - bbox1[3];
    }
    return ruler.distance([0.0, 0.0], [dx, dy]);
}

function pointToLineDistance(
    point: [number, number],
    line: [number, number][],
    ruler: CheapRuler
): number {
    const nearestPoint = ruler.pointOnLine(line, point);
    return ruler.distance(point, nearestPoint.point);
}

function segmentToSegmentDistance(
    p1: [number, number],
    p2: [number, number],
    q1: [number, number],
    q2: [number, number],
    ruler: CheapRuler
): number {
    const dist1 = Math.min(
        pointToLineDistance(p1, [q1, q2], ruler),
        pointToLineDistance(p2, [q1, q2], ruler)
    );
    const dist2 = Math.min(
        pointToLineDistance(q1, [p1, p2], ruler),
        pointToLineDistance(q2, [p1, p2], ruler)
    );
    return Math.min(dist1, dist2);
}

function lineToLineDistance(
    line1: [number, number][],
    range1: IndexRange,
    line2: [number, number][],
    range2: IndexRange,
    ruler: CheapRuler
): number {
    const rangeSafe = isRangeSafe(range1, line1.length) && isRangeSafe(range2, line2.length);
    if (!rangeSafe) {
        return Infinity;
    }

    let dist = Infinity;
    for (let i = range1[0]; i < range1[1]; ++i) {
        const p1 = line1[i];
        const p2 = line1[i + 1];
        for (let j = range2[0]; j < range2[1]; ++j) {
            const q1 = line2[j];
            const q2 = line2[j + 1];
            if (segmentIntersectSegment(p1, p2, q1, q2)) {
                return 0.0;
            }
            dist = Math.min(dist, segmentToSegmentDistance(p1, p2, q1, q2, ruler));
        }
    }
    return dist;
}

function pointsToPointsDistance(
    points1: [number, number][],
    range1: IndexRange,
    points2: [number, number][],
    range2: IndexRange,
    ruler: CheapRuler
): number {
    const rangeSafe = isRangeSafe(range1, points1.length) && isRangeSafe(range2, points2.length);
    if (!rangeSafe) {
        return NaN;
    }

    let dist = Infinity;
    for (let i = range1[0]; i <= range1[1]; ++i) {
        for (let j = range2[0]; j <= range2[1]; ++j) {
            dist = Math.min(dist, ruler.distance(points1[i], points2[j]));
            if (dist === 0.0) {
                return dist;
            }
        }
    }
    return dist;
}

function pointToPolygonDistance(
    point: [number, number],
    polygon: [number, number][][],
    ruler: CheapRuler
): number {
    if (pointWithinPolygon(point, polygon, true)) {
        return 0.0;
    }
    let dist = Infinity;
    for (const ring of polygon) {
        const front = ring[0];
        const back = ring[ring.length - 1];
        if (front !== back) {
            dist = Math.min(dist, pointToLineDistance(point, [back, front], ruler));
            if (dist === 0.0) {
                return dist;
            }
        }
        const nearestPoint = ruler.pointOnLine(ring, point);
        dist = Math.min(dist, ruler.distance(point, nearestPoint.point));
        if (dist === 0.0) {
            return dist;
        }
    }
    return dist;
}

function lineToPolygonDistance(
    line: [number, number][],
    range: IndexRange,
    polygon: [number, number][][],
    ruler: CheapRuler
): number {
    if (!isRangeSafe(range, line.length)) {
        return NaN;
    }

    for (let i = range[0]; i <= range[1]; ++i) {
        if (pointWithinPolygon(line[i], polygon, true)) {
            return 0.0;
        }
    }

    let dist = Infinity;
    for (let i = range[0]; i < range[1]; ++i) {
        const p1 = line[i];
        const p2 = line[i + 1];
        for (const ring of polygon) {
            for (let j = 0, len = ring.length, k = len - 1; j < len; k = j++) {
                const q1 = ring[k];
                const q2 = ring[j];
                if (segmentIntersectSegment(p1, p2, q1, q2)) {
                    return 0.0;
                }
                dist = Math.min(dist, segmentToSegmentDistance(p1, p2, q1, q2, ruler));
            }
        }
    }
    return dist;
}

function polygonIntersect(poly1: [number, number][][], poly2: [number, number][][]): boolean {
    for (const ring of poly1) {
        for (const point of ring) {
            if (pointWithinPolygon(point, poly2, true)) {
                return true;
            }
        }
    }
    return false;
}

function polygonToPolygonDistance(
    polygon1: [number, number][][],
    polygon2: [number, number][][],
    ruler,
    currentMiniDist = Infinity
): number {
    const bbox1 = getPolygonBBox(polygon1);
    const bbox2 = getPolygonBBox(polygon2);
    if (
        currentMiniDist !== Infinity &&
        bboxToBBoxDistance(bbox1, bbox2, ruler) >= currentMiniDist
    ) {
        return currentMiniDist;
    }

    if (boxWithinBox(bbox1, bbox2)) {
        if (polygonIntersect(polygon1, polygon2)) {
            return 0.0;
        }
    } else if (polygonIntersect(polygon2, polygon1)) {
        return 0.0;
    }

    let dist = Infinity;
    for (const ring1 of polygon1) {
        for (let i = 0, len1 = ring1.length, l = len1 - 1; i < len1; l = i++) {
            const p1 = ring1[l];
            const p2 = ring1[i];
            for (const ring2 of polygon2) {
                for (let j = 0, len2 = ring2.length, k = len2 - 1; j < len2; k = j++) {
                    const q1 = ring2[k];
                    const q2 = ring2[j];
                    if (segmentIntersectSegment(p1, p2, q1, q2)) {
                        return 0.0;
                    }
                    dist = Math.min(dist, segmentToSegmentDistance(p1, p2, q1, q2, ruler));
                }
            }
        }
    }
    return dist;
}

function updateQueue(
    distQueue: TinyQueue<DistPair>,
    miniDist: number,
    ruler: CheapRuler,
    points: [number, number][],
    polyBBox: BBox,
    rangeA?: IndexRange
) {
    if (!rangeA) {
        return;
    }
    const tempDist = bboxToBBoxDistance(getBBox(points, rangeA), polyBBox, ruler);
    // Insert new pair to the queue if the bbox distance is less than
    // miniDist, The pair with biggest distance will be at the top
    if (tempDist < miniDist) {
        distQueue.push([tempDist, rangeA, [0, 0]]);
    }
}

function updateQueueTwoSets(
    distQueue: TinyQueue<DistPair>,
    miniDist: number,
    ruler: CheapRuler,
    pointSet1: [number, number][],
    pointSet2: [number, number][],
    range1?: IndexRange,
    range2?: IndexRange
) {
    if (!range1 || !range2) {
        return;
    }
    const tempDist = bboxToBBoxDistance(
        getBBox(pointSet1, range1),
        getBBox(pointSet2, range2),
        ruler
    );
    // Insert new pair to the queue if the bbox distance is less than
    // miniDist, The pair with biggest distance will be at the top
    if (tempDist < miniDist) {
        distQueue.push([tempDist, range1, range2]);
    }
}

// Divide and conquer, the time complexity is O(n*lgn), faster than Brute force
// O(n*n) Most of the time, use index for in-place processing.
function pointsToPolygonDistance(
    points: [number, number][],
    isLine: boolean,
    polygon: [number, number][][],
    ruler: CheapRuler,
    currentMiniDist = Infinity
) {
    let miniDist = Math.min(ruler.distance(points[0], polygon[0][0]), currentMiniDist);
    if (miniDist === 0.0) {
        return miniDist;
    }

    const distQueue = new TinyQueue<DistPair>(
        [[0, [0, points.length - 1], [0, 0]]],
        compareDistPair
    );

    const polyBBox = getPolygonBBox(polygon);
    while (distQueue.length > 0) {
        const distPair = distQueue.pop();
        if (distPair[0] >= miniDist) {
            continue;
        }

        const range = distPair[1];

        // In case the set size are relatively small, we could use brute-force directly
        const threshold = isLine ? MinLinePointsSize : MinPointsSize;
        if (getRangeSize(range) <= threshold) {
            if (!isRangeSafe(range, points.length)) {
                return NaN;
            }
            if (isLine) {
                const tempDist = lineToPolygonDistance(points, range, polygon, ruler);
                if (isNaN(tempDist) || tempDist === 0.0) {
                    return tempDist;
                }
                miniDist = Math.min(miniDist, tempDist);
            } else {
                for (let i = range[0]; i <= range[1]; ++i) {
                    const tempDist = pointToPolygonDistance(points[i], polygon, ruler);
                    miniDist = Math.min(miniDist, tempDist);
                    if (miniDist === 0.0) {
                        return 0.0;
                    }
                }
            }
        } else {
            const newRangesA = splitRange(range, isLine);

            updateQueue(distQueue, miniDist, ruler, points, polyBBox, newRangesA[0]);
            updateQueue(distQueue, miniDist, ruler, points, polyBBox, newRangesA[1]);
        }
    }
    return miniDist;
}

function pointSetToPointSetDistance(
    pointSet1: [number, number][],
    isLine1: boolean,
    pointSet2: [number, number][],
    isLine2: boolean,
    ruler: CheapRuler,
    currentMiniDist = Infinity
): number {
    let miniDist = Math.min(currentMiniDist, ruler.distance(pointSet1[0], pointSet2[0]));
    if (miniDist === 0.0) {
        return miniDist;
    }

    const distQueue = new TinyQueue<DistPair>(
        [[0, [0, pointSet1.length - 1], [0, pointSet2.length - 1]]],
        compareDistPair
    );

    while (distQueue.length > 0) {
        const distPair = distQueue.pop();
        if (distPair[0] >= miniDist) {
            continue;
        }

        const rangeA = distPair[1];
        const rangeB = distPair[2];
        const threshold1 = isLine1 ? MinLinePointsSize : MinPointsSize;
        const threshold2 = isLine2 ? MinLinePointsSize : MinPointsSize;

        // In case the set size are relatively small, we could use brute-force directly
        if (getRangeSize(rangeA) <= threshold1 && getRangeSize(rangeB) <= threshold2) {
            if (!isRangeSafe(rangeA, pointSet1.length) && isRangeSafe(rangeB, pointSet2.length)) {
                return NaN;
            }
            let tempDist: number;
            if (isLine1 && isLine2) {
                tempDist = lineToLineDistance(pointSet1, rangeA, pointSet2, rangeB, ruler);
                miniDist = Math.min(miniDist, tempDist);
            } else if (isLine1 && !isLine2) {
                const sublibe = pointSet1.slice(rangeA[0], rangeA[1] + 1);
                for (let i = rangeB[0]; i <= rangeB[1]; ++i) {
                    tempDist = pointToLineDistance(pointSet2[i], sublibe, ruler);
                    miniDist = Math.min(miniDist, tempDist);
                    if (miniDist === 0.0) {
                        return miniDist;
                    }
                }
            } else if (!isLine1 && isLine2) {
                const sublibe = pointSet2.slice(rangeB[0], rangeB[1] + 1);
                for (let i = rangeA[0]; i <= rangeA[1]; ++i) {
                    tempDist = pointToLineDistance(pointSet1[i], sublibe, ruler);
                    miniDist = Math.min(miniDist, tempDist);
                    if (miniDist === 0.0) {
                        return miniDist;
                    }
                }
            } else {
                tempDist = pointsToPointsDistance(pointSet1, rangeA, pointSet2, rangeB, ruler);
                miniDist = Math.min(miniDist, tempDist);
            }
        } else {
            const newRangesA = splitRange(rangeA, isLine1);
            const newRangesB = splitRange(rangeB, isLine2);
            updateQueueTwoSets(
                distQueue,
                miniDist,
                ruler,
                pointSet1,
                pointSet2,
                newRangesA[0],
                newRangesB[0]
            );
            updateQueueTwoSets(
                distQueue,
                miniDist,
                ruler,
                pointSet1,
                pointSet2,
                newRangesA[0],
                newRangesB[1]
            );
            updateQueueTwoSets(
                distQueue,
                miniDist,
                ruler,
                pointSet1,
                pointSet2,
                newRangesA[1],
                newRangesB[0]
            );
            updateQueueTwoSets(
                distQueue,
                miniDist,
                ruler,
                pointSet1,
                pointSet2,
                newRangesA[1],
                newRangesB[1]
            );
        }
    }
    return miniDist;
}

function pointToGeometryDistance(ctx: EvaluationContext, geometries: SimpleGeometry[]) {
    const tilePoints = ctx.geometry();
    const pointPosition = tilePoints
        .flat()
        .map((p) => getLngLatFromTileCoord([p.x, p.y], ctx.canonical) as [number, number]);
    if (tilePoints.length === 0) {
        return NaN;
    }
    const ruler = new CheapRuler(pointPosition[0][1]);
    let dist = Infinity;
    for (const geometry of geometries) {
        switch (geometry.type) {
            case 'Point':
                dist = Math.min(
                    dist,
                    pointSetToPointSetDistance(
                        pointPosition,
                        false,
                        [geometry.coordinates as [number, number]],
                        false,
                        ruler,
                        dist
                    )
                );
                break;
            case 'LineString':
                dist = Math.min(
                    dist,
                    pointSetToPointSetDistance(
                        pointPosition,
                        false,
                        geometry.coordinates as [number, number][],
                        true,
                        ruler,
                        dist
                    )
                );
                break;
            case 'Polygon':
                dist = Math.min(
                    dist,
                    pointsToPolygonDistance(
                        pointPosition,
                        false,
                        geometry.coordinates as [number, number][][],
                        ruler,
                        dist
                    )
                );
                break;
        }
        if (dist === 0.0) {
            return dist;
        }
    }
    return dist;
}

function lineStringToGeometryDistance(ctx: EvaluationContext, geometries: SimpleGeometry[]) {
    const tileLine = ctx.geometry();
    const linePositions = tileLine
        .flat()
        .map((p) => getLngLatFromTileCoord([p.x, p.y], ctx.canonical) as [number, number]);
    if (tileLine.length === 0) {
        return NaN;
    }
    const ruler = new CheapRuler(linePositions[0][1]);
    let dist = Infinity;
    for (const geometry of geometries) {
        switch (geometry.type) {
            case 'Point':
                dist = Math.min(
                    dist,
                    pointSetToPointSetDistance(
                        linePositions,
                        true,
                        [geometry.coordinates as [number, number]],
                        false,
                        ruler,
                        dist
                    )
                );
                break;
            case 'LineString':
                dist = Math.min(
                    dist,
                    pointSetToPointSetDistance(
                        linePositions,
                        true,
                        geometry.coordinates as [number, number][],
                        true,
                        ruler,
                        dist
                    )
                );
                break;
            case 'Polygon':
                dist = Math.min(
                    dist,
                    pointsToPolygonDistance(
                        linePositions,
                        true,
                        geometry.coordinates as [number, number][][],
                        ruler,
                        dist
                    )
                );
                break;
        }
        if (dist === 0.0) {
            return dist;
        }
    }
    return dist;
}

function polygonToGeometryDistance(ctx: EvaluationContext, geometries: SimpleGeometry[]) {
    const tilePolygon = ctx.geometry();
    if (tilePolygon.length === 0 || tilePolygon[0].length === 0) {
        return NaN;
    }
    const polygons = classifyRings(tilePolygon, 0).map((polygon) => {
        return polygon.map((ring) => {
            return ring.map(
                (p) => getLngLatFromTileCoord([p.x, p.y], ctx.canonical) as [number, number]
            );
        });
    });
    const ruler = new CheapRuler(polygons[0][0][0][1]);
    let dist = Infinity;
    for (const geometry of geometries) {
        for (const polygon of polygons) {
            switch (geometry.type) {
                case 'Point':
                    dist = Math.min(
                        dist,
                        pointsToPolygonDistance(
                            [geometry.coordinates as [number, number]],
                            false,
                            polygon,
                            ruler,
                            dist
                        )
                    );
                    break;
                case 'LineString':
                    dist = Math.min(
                        dist,
                        pointsToPolygonDistance(
                            geometry.coordinates as [number, number][],
                            true,
                            polygon,
                            ruler,
                            dist
                        )
                    );
                    break;
                case 'Polygon':
                    dist = Math.min(
                        dist,
                        polygonToPolygonDistance(
                            polygon,
                            geometry.coordinates as [number, number][][],
                            ruler,
                            dist
                        )
                    );
                    break;
            }
            if (dist === 0.0) {
                return dist;
            }
        }
    }
    return dist;
}

function toSimpleGeometry(
    geometry: Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>
): SimpleGeometry[] {
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.map((polygon) => {
            return {
                type: 'Polygon',
                coordinates: polygon
            };
        });
    }
    if (geometry.type === 'MultiLineString') {
        return geometry.coordinates.map((lineString) => {
            return {
                type: 'LineString',
                coordinates: lineString
            };
        });
    }
    if (geometry.type === 'MultiPoint') {
        return geometry.coordinates.map((point) => {
            return {
                type: 'Point',
                coordinates: point
            };
        });
    }
    return [geometry];
}

export class Distance implements Expression {
    type: Type;
    geojson: GeoJSON.GeoJSON;
    geometries: SimpleGeometry[];

    constructor(geojson: GeoJSON.GeoJSON, geometries: SimpleGeometry[]) {
        this.type = NumberType;
        this.geojson = geojson;
        this.geometries = geometries;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(
                `'distance' expression requires exactly one argument, but found ${args.length - 1} instead.`
            ) as null;
        if (isValue(args[1])) {
            const geojson = args[1] as any;
            if (geojson.type === 'FeatureCollection') {
                return new Distance(
                    geojson,
                    geojson.features.map((feature) => toSimpleGeometry(feature.geometry)).flat()
                );
            } else if (geojson.type === 'Feature') {
                return new Distance(geojson, toSimpleGeometry(geojson.geometry));
            } else if ('type' in geojson && 'coordinates' in geojson) {
                return new Distance(geojson, toSimpleGeometry(geojson));
            }
        }
        return context.error(
            "'distance' expression requires valid geojson object that contains polygon geometry type."
        ) as null;
    }

    evaluate(ctx: EvaluationContext) {
        if (ctx.geometry() != null && ctx.canonicalID() != null) {
            if (ctx.geometryType() === 'Point') {
                return pointToGeometryDistance(ctx, this.geometries);
            } else if (ctx.geometryType() === 'LineString') {
                return lineStringToGeometryDistance(ctx, this.geometries);
            } else if (ctx.geometryType() === 'Polygon') {
                return polygonToGeometryDistance(ctx, this.geometries);
            }
        }
        return NaN;
    }

    eachChild() {}

    outputDefined(): boolean {
        return true;
    }
}

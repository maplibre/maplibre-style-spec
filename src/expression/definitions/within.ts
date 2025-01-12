import {isValue} from '../values';
import type {Type} from '../types';
import {BooleanType} from '../types';
import type {Expression} from '../expression';
import type {ParsingContext} from '../parsing_context';
import type {EvaluationContext} from '../evaluation_context';
import {ICanonicalTileID} from '../../tiles_and_coordinates';
import {BBox, EXTENT, boxWithinBox, getTileCoordinates, lineStringWithinPolygon, lineStringWithinPolygons, pointWithinPolygon, pointWithinPolygons, updateBBox} from '../../util/geometry_util';
import {Point2D} from '../../point2d';

type GeoJSONPolygons = GeoJSON.Polygon | GeoJSON.MultiPolygon;

function getTilePolygon(coordinates: GeoJSON.Position[][], bbox: BBox, canonical: ICanonicalTileID) {
    const polygon = [];
    for (let i = 0; i < coordinates.length; i++) {
        const ring = [];
        for (let j = 0; j < coordinates[i].length; j++) {
            const coord = getTileCoordinates(coordinates[i][j], canonical);
            updateBBox(bbox, coord);
            ring.push(coord);
        }
        polygon.push(ring);
    }
    return polygon;
}

function getTilePolygons(coordinates: GeoJSON.Position[][][], bbox: BBox, canonical: ICanonicalTileID) {
    const polygons = [];
    for (let i = 0; i < coordinates.length; i++) {
        const polygon = getTilePolygon(coordinates[i], bbox, canonical);
        polygons.push(polygon);
    }
    return polygons;
}

function updatePoint(p: GeoJSON.Position, bbox: BBox, polyBBox: BBox, worldSize: number) {
    if (p[0] < polyBBox[0] || p[0] > polyBBox[2]) {
        const halfWorldSize = worldSize * 0.5;
        let shift = (p[0] - polyBBox[0] > halfWorldSize) ? -worldSize : (polyBBox[0] - p[0] > halfWorldSize) ? worldSize : 0;
        if (shift === 0) {
            shift = (p[0] - polyBBox[2] > halfWorldSize) ? -worldSize : (polyBBox[2] - p[0] > halfWorldSize) ? worldSize : 0;
        }
        p[0] += shift;
    }
    updateBBox(bbox, p);
}

function resetBBox(bbox: BBox) {
    bbox[0] = bbox[1] = Infinity;
    bbox[2] = bbox[3] = -Infinity;
}

function getTilePoints(geometry: Point2D[][], pointBBox: BBox, polyBBox: BBox, canonical: ICanonicalTileID): [number, number][] {
    const worldSize = Math.pow(2, canonical.z) * EXTENT;
    const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
    const tilePoints: [number, number][] = [];
    for (const points of geometry) {
        for (const point of points) {
            const p: [number, number] = [point.x + shifts[0], point.y + shifts[1]];
            updatePoint(p, pointBBox, polyBBox, worldSize);
            tilePoints.push(p);
        }
    }
    return tilePoints;
}

function getTileLines(geometry: Point2D[][], lineBBox: BBox, polyBBox: BBox, canonical: ICanonicalTileID): [number, number][][] {
    const worldSize = Math.pow(2, canonical.z) * EXTENT;
    const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
    const tileLines: [number, number][][] = [];
    for (const line of geometry) {
        const tileLine:[number, number][] = [];
        for (const point of line) {
            const p: [number, number] = [point.x + shifts[0], point.y + shifts[1]];
            updateBBox(lineBBox, p);
            tileLine.push(p);
        }
        tileLines.push(tileLine);
    }
    if (lineBBox[2] - lineBBox[0] <= worldSize / 2) {
        resetBBox(lineBBox);
        for (const line of tileLines) {
            for (const p of line) {
                updatePoint(p, lineBBox, polyBBox, worldSize);
            }
        }
    }
    return tileLines;
}

function pointsWithinPolygons(ctx: EvaluationContext, polygonGeometry: GeoJSONPolygons) {
    const pointBBox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
    const polyBBox: BBox = [Infinity, Infinity, -Infinity, -Infinity];

    const canonical = ctx.canonicalID();

    if (polygonGeometry.type === 'Polygon') {
        const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
        const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
        if (!boxWithinBox(pointBBox, polyBBox)) return false;

        for (const point of tilePoints) {
            if (!pointWithinPolygon(point, tilePolygon)) return false;
        }
    }
    if (polygonGeometry.type === 'MultiPolygon') {
        const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
        const tilePoints = getTilePoints(ctx.geometry(), pointBBox, polyBBox, canonical);
        if (!boxWithinBox(pointBBox, polyBBox)) return false;

        for (const point of tilePoints) {
            if (!pointWithinPolygons(point, tilePolygons)) return false;
        }
    }

    return true;
}

function linesWithinPolygons(ctx: EvaluationContext, polygonGeometry: GeoJSONPolygons) {
    const lineBBox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
    const polyBBox: BBox = [Infinity, Infinity, -Infinity, -Infinity];

    const canonical = ctx.canonicalID();

    if (polygonGeometry.type === 'Polygon') {
        const tilePolygon = getTilePolygon(polygonGeometry.coordinates, polyBBox, canonical);
        const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
        if (!boxWithinBox(lineBBox, polyBBox)) return false;

        for (const line of tileLines) {
            if (!lineStringWithinPolygon(line, tilePolygon)) return false;
        }
    }
    if (polygonGeometry.type === 'MultiPolygon') {
        const tilePolygons = getTilePolygons(polygonGeometry.coordinates, polyBBox, canonical);
        const tileLines = getTileLines(ctx.geometry(), lineBBox, polyBBox, canonical);
        if (!boxWithinBox(lineBBox, polyBBox)) return false;

        for (const line of tileLines) {
            if (!lineStringWithinPolygons(line, tilePolygons)) return false;
        }
    }
    return true;
}

export class Within implements Expression {
    type: Type;
    geojson: GeoJSON.GeoJSON;
    geometries: GeoJSONPolygons;

    constructor(geojson: GeoJSON.GeoJSON, geometries: GeoJSONPolygons) {
        this.type = BooleanType;
        this.geojson = geojson;
        this.geometries = geometries;
    }

    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression {
        if (args.length !== 2)
            return context.error(`'within' expression requires exactly one argument, but found ${args.length - 1} instead.`) as null;
        if (isValue(args[1])) {
            const geojson = (args[1] as any);
            if (geojson.type === 'FeatureCollection') {
                const polygonsCoords: GeoJSON.Position[][][] = [];
                for (const polygon of geojson.features) {
                    const {type, coordinates} = polygon.geometry;
                    if (type === 'Polygon') {
                        polygonsCoords.push(coordinates);
                    }
                    if (type === 'MultiPolygon') {
                        polygonsCoords.push(...coordinates);
                    }
                }
                if (polygonsCoords.length) {
                    const multipolygonWrapper: GeoJSON.MultiPolygon = {
                        type: 'MultiPolygon',
                        coordinates: polygonsCoords
                    };
                    return new Within(geojson, multipolygonWrapper);
                }

            } else if (geojson.type === 'Feature') {
                const type = geojson.geometry.type;
                if (type === 'Polygon' || type === 'MultiPolygon') {
                    return new Within(geojson, geojson.geometry);
                }
            } else if (geojson.type  === 'Polygon' || geojson.type === 'MultiPolygon') {
                return new Within(geojson, geojson);
            }
        }
        return context.error('\'within\' expression requires valid geojson object that contains polygon geometry type.') as null;
    }

    evaluate(ctx: EvaluationContext) {
        if (ctx.geometry() != null && ctx.canonicalID() != null) {
            if (ctx.geometryType() === 'Point') {
                return pointsWithinPolygons(ctx, this.geometries);
            } else if (ctx.geometryType() === 'LineString') {
                return linesWithinPolygons(ctx, this.geometries);
            }
        }
        return false;
    }

    eachChild() {}

    outputDefined(): boolean {
        return true;
    }
}

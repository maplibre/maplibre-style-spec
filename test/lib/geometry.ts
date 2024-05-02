
import {ICanonicalTileID} from '../../src';
import {Point2D} from '../../src/point2d';
import {EXTENT, getTileCoordinates} from '../../src/util/geometry_util';

function getPoint(coord: GeoJSON.Position, canonical: ICanonicalTileID): Point2D {
    const tileCoords = getTileCoordinates(coord, canonical);
    // this shift is to place the point relative to the tile instead of the world
    const shifts = [canonical.x * EXTENT, canonical.y * EXTENT];
    const x = tileCoords[0] - shifts[0];
    const y = tileCoords[1] - shifts[1];
    return {x, y};
}

function convertPoint(coord: GeoJSON.Position, canonical: ICanonicalTileID): Point2D[] {
    return [getPoint(coord, canonical)];
}

function convertPoints(coords: GeoJSON.Position[], canonical: ICanonicalTileID): Point2D[][] {
    const o: Point2D[][] = [];
    for (let i = 0; i < coords.length; i++) {
        o.push(convertPoint(coords[i], canonical));
    }

    return o;
}

function convertLine(line: GeoJSON.Position[], canonical: ICanonicalTileID): Point2D[] {
    const l: Point2D[] = [];
    for (let i = 0; i < line.length; i++) {
        l.push(getPoint(line[i], canonical));
    }
    return l;
}

function convertLines(lines: GeoJSON.Position[][], canonical: ICanonicalTileID): Point2D[][] {
    const l: Point2D[][] = [];
    for (let i = 0; i < lines.length; i++) {
        l.push(convertLine(lines[i], canonical));
    }
    return l;
}

export function getGeometry(feature: {type?: any; id?: any; geometry?: Point2D[][]},
    geometry: GeoJSON.MultiLineString | GeoJSON.LineString | GeoJSON.Point | GeoJSON.MultiPoint | GeoJSON.Polygon | GeoJSON.MultiPolygon,
    canonical: ICanonicalTileID) {
    if (!geometry.coordinates) {
        return;
    }
    feature.type = geometry.type;
    feature.geometry = [];
    switch (geometry.type) {
        case 'Point':
            feature.geometry.push(convertPoint(geometry.coordinates, canonical));
            break;
        case 'MultiPoint':
            feature.type = 'Point';
            feature.geometry.push(...convertPoints(geometry.coordinates, canonical));
            break;
        case 'LineString':
            feature.geometry.push(convertLine(geometry.coordinates, canonical));
            break;
        case 'MultiLineString':
            feature.type = 'LineString';
            feature.geometry.push(...convertLines(geometry.coordinates, canonical));
            break;
        case 'Polygon':
            feature.geometry.push(...convertLines(geometry.coordinates, canonical));
            break;
        case 'MultiPolygon':
            feature.type = 'Polygon';
            for (let i = 0; i < geometry.coordinates.length; i++) {
                const polygon: Point2D[][] = [];
                polygon.push(...convertLines(geometry.coordinates[i], canonical));
                feature.geometry.push(...polygon);
            }
    }
}

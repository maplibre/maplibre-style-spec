
import {ICanonicalTileID, ILngLatLike} from '../../src';
import {Point2D} from '../../src/point2d';
import {getPoint} from './util';

function convertPoint(coord: ILngLatLike, canonical: ICanonicalTileID): Point2D[] {
    return [getPoint(coord, canonical)];
}

function convertPoints(coords: ILngLatLike[], canonical: ICanonicalTileID): Point2D[][] {
    const o: Point2D[][] = [];
    for (let i = 0; i < coords.length; i++) {
        o.push(convertPoint(coords[i], canonical));
    }

    return o;
}

function convertLine(line: ILngLatLike[], canonical: ICanonicalTileID): Point2D[] {
    const l: Point2D[] = [];
    for (let i = 0; i < line.length; i++) {
        l.push(getPoint(line[i], canonical));
    }
    return l;
}

function convertLines(lines: ILngLatLike[][], canonical: ICanonicalTileID): Point2D[][] {
    const l: Point2D[][] = [];
    for (let i = 0; i < lines.length; i++) {
        l.push(convertLine(lines[i], canonical));
    }
    return l;
}

export function getGeometry(feature, geometry, canonical: ICanonicalTileID) {
    if (geometry.coordinates) {
        const coords = geometry.coordinates;
        const type = geometry.type;
        feature.type = type;
        feature.geometry = [];
        if (type === 'Point') {
            feature.geometry.push(convertPoint(coords, canonical));
        } else if (type === 'MultiPoint') {
            feature.type = 'Point';
            feature.geometry.push(...convertPoints(coords, canonical));
        } else if (type === 'LineString') {
            feature.geometry.push(convertLine(coords, canonical));
        } else if (type === 'MultiLineString') {
            feature.type = 'LineString';
            feature.geometry.push(...convertLines(coords, canonical));
        } else if (type === 'Polygon') {
            feature.geometry.push(...convertLines(coords, canonical));
        } else if (type === 'MultiPolygon') {
            feature.type = 'Polygon';
            for (let i = 0; i < coords.length; i++) {
                const polygon: Point2D[][] = [];
                polygon.push(...convertLines(coords[i], canonical));
                feature.geometry.push(polygon);
            }
        }
    }
}

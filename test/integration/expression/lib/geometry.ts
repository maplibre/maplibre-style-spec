
import {ICanonicalTileID, ILngLatLike} from '../../../../src';
import {Point2D} from '../../../../src/point2d';

export function mercatorXfromLng(lng: number) {
    return (180 + lng) / 360;
}

export function mercatorYfromLat(lat: number) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

function getTilePoint(canonical: ICanonicalTileID, coord: {x: number, y: number, z: number}): Point2D {
    const tilesAtZoom = Math.pow(2, canonical.z);
    return {
        x: (coord.x * tilesAtZoom - canonical.x) * 8192,
        y: (coord.y * tilesAtZoom - canonical.y) * 8192
    }
}

function getPoint(coord: ILngLatLike, canonical: ICanonicalTileID): Point2D {
    const p: Point2D = getTilePoint(canonical, {x: mercatorXfromLng(coord[0]), y: mercatorYfromLat(coord[1]), z: 0});
    p.x = Math.round(p.x);
    p.y = Math.round(p.y);
    return p;
}

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

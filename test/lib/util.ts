import compactStringify from 'json-stringify-pretty-compact';
import {ICanonicalTileID, ILngLatLike} from '../../src';
import {Point2D} from '../../src/point2d';
import Color from '../../src/util/color';

/**
 * @param toTest Color instance to test
 * @param expectedSerialized color serialized as string in format 'rgb(r% g% b% / alpha)'
 * @param numDigits `expect.closeTo` numDigits parameter
 */
export function expectToMatchColor(toTest: Color, expectedSerialized: string, numDigits = 5) {
    const [r, g, b, a] = expectedSerialized.match(/^rgb\(([\d.]+)% ([\d.]+)% ([\d.]+)% \/ ([\d.]+)\)$/).slice(1).map(Number);
    expect(toTest).toBeInstanceOf(Color);
    expect(toTest).toMatchObject({
        r: expect.closeTo(r / 100 * (a !== 0 ? a : 1), numDigits),
        g: expect.closeTo(g / 100 * (a !== 0 ? a : 1), numDigits),
        b: expect.closeTo(b / 100 * (a !== 0 ? a : 1), numDigits),
        a: expect.closeTo(a, 4),
    });
}

/**
 * `expect.closeTo` but for number array
 *
 * @param toTest number array to test
 * @param expected expected array values
 * @param numDigits `expect.closeTo` numDigits parameter
 */
export function expectCloseToArray(toTest: number[], expected: number[], numDigits = 5) {
    expect(toTest).toEqual(expected.map(n => isNaN(n) ? n : expect.closeTo(n, numDigits)));
}

export function getPointFromLngLat(lng: number, lat: number, canonical: ICanonicalTileID) {
    return getTilePoint(canonical, {x: mercatorXfromLng(lng), y: mercatorYfromLat(lat), z: 0});
}

function getTilePoint(canonical: ICanonicalTileID, coord: {x: number; y: number; z: number}): Point2D {
    const tilesAtZoom = Math.pow(2, canonical.z);
    return {
        x: (coord.x * tilesAtZoom - canonical.x) * 8192,
        y: (coord.y * tilesAtZoom - canonical.y) * 8192
    };
}

function mercatorXfromLng(lng: number) {
    return (180 + lng) / 360;
}

function mercatorYfromLat(lat: number) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

export function getPoint(coord: ILngLatLike, canonical: ICanonicalTileID): Point2D {
    const p: Point2D = getTilePoint(canonical, {x: mercatorXfromLng(coord[0]), y: mercatorYfromLat(coord[1]), z: 0});
    p.x = Math.round(p.x);
    p.y = Math.round(p.y);
    return p;
}

// we have to handle this edge case here because we have test fixtures for this
// edge case, and we don't want UPDATE=1 to mess with them
export function stringify(v) {
    let s = compactStringify(v);

    if (s.indexOf('\u2028') >= 0) {
        s = s.replace(/\u2028/g, '\\u2028');
    }
    if (s.indexOf('\u2029') >= 0) {
        s = s.replace(/\u2029/g, '\\u2029');
    }
    return s;
}

import {getTileBBox} from '@mapbox/whoots-js';
import EXTENT from '../extent';
import Point from '@mapbox/point-geometry';
import {IMercatorCoordinate} from './mercator_coordinate';

function calculateKey(wrap: number, overscaledZ: number, z: number, x: number, y: number): string {
    wrap *= 2;
    if (wrap < 0) wrap = wrap * -1 - 1;
    const dim = 1 << z;
    return (dim * dim * wrap + dim * y + x).toString(36) + z.toString(36) + overscaledZ.toString(36);
}

function getQuadkey(z, x, y) {
    let quadkey = '', mask;
    for (let i = z; i > 0; i--) {
        mask = 1 << (i - 1);
        quadkey += ((x & mask ? 1 : 0) + (y & mask ? 2 : 0));
    }
    return quadkey;
}

export class CanonicalTileID implements ICanonicalTileID {
    z: number;
    x: number;
    y: number;
    key: string;

    constructor(z: number, x: number, y: number) {

        if (z < 0 || z > 25 || y < 0 || y >= Math.pow(2, z) || x < 0 || x >= Math.pow(2, z)) {
            throw new Error(`x=${x}, y=${y}, z=${z} outside of bounds. 0<=x<${Math.pow(2, z)}, 0<=y<${Math.pow(2, z)} 0<=z<=25 `);
        }

        this.z = z;
        this.x = x;
        this.y = y;
        this.key = calculateKey(0, z, z, x, y);
    }

    equals(id: ICanonicalTileID) {
        return this.z === id.z && this.x === id.x && this.y === id.y;
    }

    // given a list of urls, choose a url template and return a tile URL
    url(urls: Array<string>, pixelRatio: number, scheme?: string | null) {
        const bbox = getTileBBox(this.x, this.y, this.z);
        const quadkey = getQuadkey(this.z, this.x, this.y);

        return urls[(this.x + this.y) % urls.length]
            .replace(/{prefix}/g, (this.x % 16).toString(16) + (this.y % 16).toString(16))
            .replace(/{z}/g, String(this.z))
            .replace(/{x}/g, String(this.x))
            .replace(/{y}/g, String(scheme === 'tms' ? (Math.pow(2, this.z) - this.y - 1) : this.y))
            .replace(/{ratio}/g, pixelRatio > 1 ? '@2x' : '')
            .replace(/{quadkey}/g, quadkey)
            .replace(/{bbox-epsg-3857}/g, bbox);
    }

    isChildOf(parent: ICanonicalTileID) {
        const dz = this.z - parent.z;
        return  dz > 0 && parent.x === (this.x >> dz) && parent.y === (this.y >> dz);
    }

    getTilePoint(coord: IMercatorCoordinate) {
        const tilesAtZoom = Math.pow(2, this.z);
        return new Point(
            (coord.x * tilesAtZoom - this.x) * EXTENT,
            (coord.y * tilesAtZoom - this.y) * EXTENT);
    }

    toString() {
        return `${this.z}/${this.x}/${this.y}`;
    }
}

export interface ICanonicalTileID {
    z: number;
    x: number;
    y: number;
    key: string;
    equals(id: ICanonicalTileID): {};
    url(urls: Array<string>, pixelRatio: number, scheme: string | null): {};
    isChildOf(parent: ICanonicalTileID): {};
    getTilePoint(coord: IMercatorCoordinate): {};
    toString(): {};
}


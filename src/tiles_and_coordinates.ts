import {Point2D} from './point2d';

export interface ICanonicalTileID {
    z: number;
    x: number;
    y: number;
    key: string;
    equals(id: ICanonicalTileID): {};
    url(urls: Array<string>, pixelRatio: number, scheme: string | null): {};
    isChildOf(parent: ICanonicalTileID): {};
    getTilePoint(coord: IMercatorCoordinate): Point2D;
    toString(): {};
}

export interface IMercatorCoordinate {
    x: number;
    y: number;

    toLngLat(): {};
    toAltitude(): {};
    meterInMercatorCoordinateUnits(): {};
}

export interface ILngLat {
    wrap(): {};
    toArray(): {};
    toString(): {};
    distanceTo(lngLat: ILngLat): {};
    convert(input: ILngLatLike): ILngLat;
}

export type ILngLatLike = ILngLat | {
    lng: number;
    lat: number;
} | {
    lon: number;
    lat: number;
} | [number, number];

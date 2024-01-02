import {Point2D} from './point2d';

export interface ICanonicalTileID {
    z: number;
    x: number;
    y: number;
    key: string;
    equals(id: ICanonicalTileID): boolean;
    url(urls: Array<string>, pixelRatio: number, scheme: string | null): string;
    isChildOf(parent: ICanonicalTileID): boolean;
    getTilePoint(coord: IMercatorCoordinate): Point2D;
    toString(): string;
}

export interface IMercatorCoordinate {
    x: number;
    y: number;
    z: number;

    toLngLat(): ILngLat;
    toAltitude(): number;
    meterInMercatorCoordinateUnits(): number;
}

export interface ILngLat {
    lng: number;
    lat: number;

    wrap(): ILngLat;
    toArray(): [number, number];
    distanceTo(lngLat: ILngLat): number;
    toString(): string;
}

export type ILngLatLike = ILngLat | {
    lng: number;
    lat: number;
} | {
    lon: number;
    lat: number;
} | [number, number];

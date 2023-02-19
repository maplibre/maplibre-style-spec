import LngLat from './lng_lat';
import type { LngLatLike } from './lng_lat';
import { IMercatorCoordinate } from '../tiles_and_coordinates';
export declare function mercatorXfromLng(lng: number): number;
export declare function mercatorYfromLat(lat: number): number;
export declare function mercatorZfromAltitude(altitude: number, lat: number): number;
export declare function lngFromMercatorX(x: number): number;
export declare function latFromMercatorY(y: number): number;
export declare function altitudeFromMercatorZ(z: number, y: number): number;
/**
 * Determine the Mercator scale factor for a given latitude, see
 * https://en.wikipedia.org/wiki/Mercator_projection#Scale_factor
 *
 * At the equator the scale factor will be 1, which increases at higher latitudes.
 *
 * @param {number} lat Latitude
 * @returns {number} scale factor
 * @private
 */
export declare function mercatorScale(lat: number): number;
/**
 * A `MercatorCoordinate` object represents a projected three dimensional position.
 *
 * `MercatorCoordinate` uses the web mercator projection ([EPSG:3857](https://epsg.io/3857)) with slightly different units:
 * - the size of 1 unit is the width of the projected world instead of the "mercator meter"
 * - the origin of the coordinate space is at the north-west corner instead of the middle
 *
 * For example, `MercatorCoordinate(0, 0, 0)` is the north-west corner of the mercator world and
 * `MercatorCoordinate(1, 1, 0)` is the south-east corner. If you are familiar with
 * [vector tiles](https://github.com/mapbox/vector-tile-spec) it may be helpful to think
 * of the coordinate space as the `0/0/0` tile with an extent of `1`.
 *
 * The `z` dimension of `MercatorCoordinate` is conformal. A cube in the mercator coordinate space would be rendered as a cube.
 *
 * @param {number} x The x component of the position.
 * @param {number} y The y component of the position.
 * @param {number} z The z component of the position.
 * @example
 * var nullIsland = new maplibregl.MercatorCoordinate(0.5, 0.5, 0);
 *
 * @see [Add a custom style layer](https://maplibre.org/maplibre-gl-js-docs/example/custom-style-layer/)
 */
declare class MercatorCoordinate implements IMercatorCoordinate {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z?: number);
    /**
     * Project a `LngLat` to a `MercatorCoordinate`.
     *
     * @param {LngLatLike} lngLatLike The location to project.
     * @param {number} altitude The altitude in meters of the position.
     * @returns {MercatorCoordinate} The projected mercator coordinate.
     * @example
     * var coord = maplibregl.MercatorCoordinate.fromLngLat({ lng: 0, lat: 0}, 0);
     * coord; // MercatorCoordinate(0.5, 0.5, 0)
     */
    static fromLngLat(lngLatLike: LngLatLike, altitude?: number): MercatorCoordinate;
    /**
     * Returns the `LngLat` for the coordinate.
     *
     * @returns {LngLat} The `LngLat` object.
     * @example
     * var coord = new maplibregl.MercatorCoordinate(0.5, 0.5, 0);
     * var lngLat = coord.toLngLat(); // LngLat(0, 0)
     */
    toLngLat(): LngLat;
    /**
     * Returns the altitude in meters of the coordinate.
     *
     * @returns {number} The altitude in meters.
     * @example
     * var coord = new maplibregl.MercatorCoordinate(0, 0, 0.02);
     * coord.toAltitude(); // 6914.281956295339
     */
    toAltitude(): number;
    /**
     * Returns the distance of 1 meter in `MercatorCoordinate` units at this latitude.
     *
     * For coordinates in real world units using meters, this naturally provides the scale
     * to transform into `MercatorCoordinate`s.
     *
     * @returns {number} Distance of 1 meter in `MercatorCoordinate` units.
     */
    meterInMercatorCoordinateUnits(): number;
}
export default MercatorCoordinate;

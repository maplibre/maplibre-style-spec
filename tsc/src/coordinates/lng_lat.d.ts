/**
 * constrain n to the given range, excluding the minimum, via modular arithmetic
 *
 * @param n value
 * @param min the minimum value to be returned, exclusive
 * @param max the maximum value to be returned, inclusive
 * @returns constrained number
 * @private
 */
export declare function wrap(n: number, min: number, max: number): number;
export declare const earthRadius = 6371008.8;
/**
 * A `LngLat` object represents a given longitude and latitude coordinate, measured in degrees.
 * These coordinates are based on the [WGS84 (EPSG:4326) standard](https://en.wikipedia.org/wiki/World_Geodetic_System#WGS84).
 *
 * MapLibre GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match the
 * [GeoJSON specification](https://tools.ietf.org/html/rfc7946).
 *
 * Note that any MapLibre GL method that accepts a `LngLat` object as an argument or option
 * can also accept an `Array` of two numbers and will perform an implicit conversion.
 * This flexible type is documented as {@link LngLatLike}.
 *
 * @param {number} lng Longitude, measured in degrees.
 * @param {number} lat Latitude, measured in degrees.
 * @example
 * var ll = new maplibregl.LngLat(-123.9749, 40.7736);
 * ll.lng; // = -123.9749
 * @see [Get coordinates of the mouse pointer](https://maplibre.org/maplibre-gl-js-docs/example/mouse-position/)
 * @see [Display a popup](https://maplibre.org/maplibre-gl-js-docs/example/popup/)
 * @see [Create a timeline animation](https://maplibre.org/maplibre-gl-js-docs/example/timeline-animation/)
 */
declare class LngLat {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number);
    /**
     * Returns a new `LngLat` object whose longitude is wrapped to the range (-180, 180).
     *
     * @returns {LngLat} The wrapped `LngLat` object.
     * @example
     * var ll = new maplibregl.LngLat(286.0251, 40.7736);
     * var wrapped = ll.wrap();
     * wrapped.lng; // = -73.9749
     */
    wrap(): LngLat;
    /**
     * Returns the coordinates represented as an array of two numbers.
     *
     * @returns {Array<number>} The coordinates represeted as an array of longitude and latitude.
     * @example
     * var ll = new maplibregl.LngLat(-73.9749, 40.7736);
     * ll.toArray(); // = [-73.9749, 40.7736]
     */
    toArray(): number[];
    /**
     * Returns the coordinates represent as a string.
     *
     * @returns {string} The coordinates represented as a string of the format `'LngLat(lng, lat)'`.
     * @example
     * var ll = new maplibregl.LngLat(-73.9749, 40.7736);
     * ll.toString(); // = "LngLat(-73.9749, 40.7736)"
     */
    toString(): string;
    /**
     * Returns the approximate distance between a pair of coordinates in meters
     * Uses the Haversine Formula (from R.W. Sinnott, "Virtues of the Haversine", Sky and Telescope, vol. 68, no. 2, 1984, p. 159)
     *
     * @param {LngLat} lngLat coordinates to compute the distance to
     * @returns {number} Distance in meters between the two coordinates.
     * @example
     * var new_york = new maplibregl.LngLat(-74.0060, 40.7128);
     * var los_angeles = new maplibregl.LngLat(-118.2437, 34.0522);
     * new_york.distanceTo(los_angeles); // = 3935751.690893987, "true distance" using a non-spherical approximation is ~3966km
     */
    distanceTo(lngLat: LngLat): number;
    /**
     * Converts an array of two numbers or an object with `lng` and `lat` or `lon` and `lat` properties
     * to a `LngLat` object.
     *
     * If a `LngLat` object is passed in, the function returns it unchanged.
     *
     * @param {LngLatLike} input An array of two numbers or object to convert, or a `LngLat` object to return.
     * @returns {LngLat} A new `LngLat` object, if a conversion occurred, or the original `LngLat` object.
     * @example
     * var arr = [-73.9749, 40.7736];
     * var ll = maplibregl.LngLat.convert(arr);
     * ll;   // = LngLat {lng: -73.9749, lat: 40.7736}
     */
    static convert(input: LngLatLike): LngLat;
}
/**
 * A {@link LngLat} object, an array of two numbers representing longitude and latitude,
 * or an object with `lng` and `lat` or `lon` and `lat` properties.
 *
 * @typedef {LngLat | {lng: number, lat: number} | {lon: number, lat: number} | [number, number]} LngLatLike
 * @example
 * var v1 = new maplibregl.LngLat(-122.420679, 37.772537);
 * var v2 = [-122.420679, 37.772537];
 * var v3 = {lon: -122.420679, lat: 37.772537};
 */
export type LngLatLike = LngLat | {
    lng: number;
    lat: number;
} | {
    lon: number;
    lat: number;
} | [number, number];
export default LngLat;

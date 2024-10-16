// This is taken from https://github.com/mapbox/cheap-ruler/ in order to take only the relevant parts

// Values that define WGS84 ellipsoid model of the Earth
const RE = 6378.137; // equatorial radius
const FE = 1 / 298.257223563; // flattening

const E2 = FE * (2 - FE);
const RAD = Math.PI / 180;

export default class CheapRuler {
    private kx: number;
    private ky: number;

    constructor(lat: number) {

        // Curvature formulas from https://en.wikipedia.org/wiki/Earth_radius#Meridional
        const m = RAD * RE * 1000;
        const coslat = Math.cos(lat * RAD);
        const w2 = 1 / (1 - E2 * (1 - coslat * coslat));
        const w = Math.sqrt(w2);

        // multipliers for converting longitude and latitude degrees into distance
        this.kx = m * w * coslat;        // based on normal radius of curvature
        this.ky = m * w * w2 * (1 - E2); // based on meridional radius of curvature
    }

    /**
     * Given two points of the form [longitude, latitude], returns the distance.
     *
     * @param a - point [longitude, latitude]
     * @param b - point [longitude, latitude]
     * @returns distance
     * @example
     * const distance = ruler.distance([30.5, 50.5], [30.51, 50.49]);
     * //=distance
     */
    public distance(a: [number, number], b: [number, number]) {
        const dx = this.wrap(a[0] - b[0]) * this.kx;
        const dy = (a[1] - b[1]) * this.ky;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns an object of the form {point, index, t}, where point is closest point on the line
     * from the given point, index is the start index of the segment with the closest point,
     * and t is a parameter from 0 to 1 that indicates where the closest point is on that segment.
     *
     * @param line - an array of points that form the line
     * @param p - point [longitude, latitude]
     * @returns the nearest point, its index in the array and the proportion along the line
     * @example
     * const point = ruler.pointOnLine(line, [-67.04, 50.5]).point;
     * //=point
     */
    public pointOnLine(line: [number, number][], p: [number, number]) {
        let minDist = Infinity;
        let minX: number, minY: number, minI: number, minT: number;

        for (let i = 0; i < line.length - 1; i++) {

            let x = line[i][0];
            let y = line[i][1];
            let dx = this.wrap(line[i + 1][0] - x) * this.kx;
            let dy = (line[i + 1][1] - y) * this.ky;
            let t = 0;

            if (dx !== 0 || dy !== 0) {
                t = (this.wrap(p[0] - x) * this.kx * dx + (p[1] - y) * this.ky * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = line[i + 1][0];
                    y = line[i + 1][1];

                } else if (t > 0) {
                    x += (dx / this.kx) * t;
                    y += (dy / this.ky) * t;
                }
            }

            dx = this.wrap(p[0] - x) * this.kx;
            dy = (p[1] - y) * this.ky;

            const sqDist = dx * dx + dy * dy;
            if (sqDist < minDist) {
                minDist = sqDist;
                minX = x;
                minY = y;
                minI = i;
                minT = t;
            }
        }

        return {
            point: [minX, minY] as [number, number],
            index: minI,
            t: Math.max(0, Math.min(1, minT))
        };
    }

    private wrap(deg: number) {
        while (deg < -180) deg += 360;
        while (deg > 180) deg -= 360;
        return deg;
    }
}

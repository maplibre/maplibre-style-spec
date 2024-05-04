import {Point2D} from '../point2d';
import {RingWithArea, classifyRings} from './classify_rings';

describe('classifyRings', () => {
    test('classified.length', () => {
        let geometry: Point2D[][];
        let classified: RingWithArea<Point2D>[][];

        geometry = [
            [
                {x: 0, y: 0},
                {x: 0, y: 40},
                {x: 40, y: 40},
                {x: 40, y: 0},
                {x: 0, y: 0}
            ]
        ];
        classified = classifyRings(geometry, undefined);
        expect(classified).toHaveLength(1);
        expect(classified[0]).toHaveLength(1);

        geometry = [
            [
                {x: 0, y: 0},
                {x: 0, y: 40},
                {x: 40, y: 40},
                {x: 40, y: 0},
                {x: 0, y: 0}
            ],
            [
                {x: 60, y: 0},
                {x: 60, y: 40},
                {x: 100, y: 40},
                {x: 100, y: 0},
                {x: 60, y: 0}
            ]
        ];
        classified = classifyRings(geometry, undefined);
        expect(classified).toHaveLength(2);
        expect(classified[0]).toHaveLength(1);
        expect(classified[1]).toHaveLength(1);

        geometry = [
            [
                {x: 0, y: 0},
                {x: 0, y: 40},
                {x: 40, y: 40},
                {x: 40, y: 0},
                {x: 0, y: 0}
            ],
            [
                {x: 10, y: 10},
                {x: 20, y: 10},
                {x: 20, y: 20},
                {x: 10, y: 10}
            ]
        ];
        classified = classifyRings(geometry, undefined);
        expect(classified).toHaveLength(1);
        expect(classified[0]).toHaveLength(2);
    });
});

describe('classifyRings + maxRings', () => {

    function createGeometry(options?) {
        const geometry = [
            // Outer ring, area = 3200
            [{x: 0, y: 0}, {x: 0, y: 40}, {x: 40, y: 40}, {x: 40, y: 0}, {x: 0, y: 0}],
            // Inner ring, area = 100
            [{x: 30, y: 30}, {x: 32, y: 30}, {x: 32, y: 32}, {x: 30, y: 30}],
            // Inner ring, area = 4
            [{x: 10, y: 10}, {x: 20, y: 10}, {x: 20, y: 20}, {x: 10, y: 10}]
        ] as Point2D[][];
        if (options && options.reverse) {
            geometry[0].reverse();
            geometry[1].reverse();
            geometry[2].reverse();
        }
        return geometry;
    }

    test('maxRings=undefined', () => {
        const geometry = classifyRings(createGeometry());
        expect(geometry).toHaveLength(1);
        expect(geometry[0]).toHaveLength(3);
        expect(geometry[0][0].area).toBe(3200);
        expect(geometry[0][1].area).toBe(4);
        expect(geometry[0][2].area).toBe(100);
    });

    test('maxRings=2', () => {
        const geometry = classifyRings(createGeometry(), 2);
        expect(geometry).toHaveLength(1);
        expect(geometry[0]).toHaveLength(2);
        expect(geometry[0][0].area).toBe(3200);
        expect(geometry[0][1].area).toBe(100);

    });

    test('maxRings=2, reversed geometry', () => {
        const geometry = classifyRings(createGeometry({reverse: true}), 2);
        expect(geometry).toHaveLength(1);
        expect(geometry[0]).toHaveLength(2);
        expect(geometry[0][0].area).toBe(3200);
        expect(geometry[0][1].area).toBe(100);
    });
});

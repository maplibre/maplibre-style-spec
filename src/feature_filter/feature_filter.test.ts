import {featureFilter, isExpressionFilter} from '.';

import {convertFilter} from './convert';
import {ICanonicalTileID} from '../tiles_and_coordinates';
import {ExpressionFilterSpecification, FilterSpecification} from '../types.g';
import {Feature} from '../expression';
import {getGeometry} from '../../test/lib/geometry';
import {describe, test, expect, vi, beforeEach} from 'vitest';

describe('filter', () => {
    test('expression, zoom', () => {
        const f = featureFilter(
            ['>=', ['number', ['get', 'x']], ['zoom']],
            'layers[0].filter'
        ).filter;
        expect(f({zoom: 1}, {properties: {x: 0}} as any as Feature)).toBe(false);
        expect(f({zoom: 1}, {properties: {x: 1.5}} as any as Feature)).toBe(true);
        expect(f({zoom: 1}, {properties: {x: 2.5}} as any as Feature)).toBe(true);
        expect(f({zoom: 2}, {properties: {x: 0}} as any as Feature)).toBe(false);
        expect(f({zoom: 2}, {properties: {x: 1.5}} as any as Feature)).toBe(false);
        expect(f({zoom: 2}, {properties: {x: 2.5}} as any as Feature)).toBe(true);
    });

    test('expression, compare two properties', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const f = featureFilter(
            ['==', ['string', ['get', 'x']], ['string', ['get', 'y']]],
            'layers[0].filter'
        ).filter;
        expect(f({zoom: 0}, {properties: {x: 1, y: 1}} as any as Feature)).toBe(false);
        expect(f({zoom: 0}, {properties: {x: '1', y: '1'}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: 'same', y: 'same'}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: null}} as any as Feature)).toBe(false);
        expect(f({zoom: 0}, {properties: {x: undefined}} as any as Feature)).toBe(false);
    });

    test('expression, collator comparison', () => {
        const caseSensitive = featureFilter(
            [
                '==',
                ['string', ['get', 'x']],
                ['string', ['get', 'y']],
                ['collator', {'case-sensitive': true}]
            ],
            'layers[0].filter'
        ).filter;
        expect(caseSensitive({zoom: 0}, {properties: {x: 'a', y: 'b'}} as any as Feature)).toBe(
            false
        );
        expect(caseSensitive({zoom: 0}, {properties: {x: 'a', y: 'A'}} as any as Feature)).toBe(
            false
        );
        expect(caseSensitive({zoom: 0}, {properties: {x: 'a', y: 'a'}} as any as Feature)).toBe(
            true
        );

        const caseInsensitive = featureFilter(
            [
                '==',
                ['string', ['get', 'x']],
                ['string', ['get', 'y']],
                ['collator', {'case-sensitive': false}]
            ],
            'layers[0].filter'
        ).filter;
        expect(caseInsensitive({zoom: 0}, {properties: {x: 'a', y: 'b'}} as any as Feature)).toBe(
            false
        );
        expect(caseInsensitive({zoom: 0}, {properties: {x: 'a', y: 'A'}} as any as Feature)).toBe(
            true
        );
        expect(caseInsensitive({zoom: 0}, {properties: {x: 'a', y: 'a'}} as any as Feature)).toBe(
            true
        );
    });

    test('expression, any/all', () => {
        expect(featureFilter(['all'], 'layers[0].filter').filter(undefined, undefined)).toBe(true);
        expect(featureFilter(['all', true], 'layers[0].filter').filter(undefined, undefined)).toBe(
            true
        );
        expect(
            featureFilter(['all', true, false], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(false);
        expect(
            featureFilter(['all', true, true], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(true);
        expect(featureFilter(['any'], 'layers[0].filter').filter(undefined, undefined)).toBe(false);
        expect(featureFilter(['any', true], 'layers[0].filter').filter(undefined, undefined)).toBe(
            true
        );
        expect(
            featureFilter(['any', true, false], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(true);
        expect(
            featureFilter(['any', false, false], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(false);
    });

    test('expression, literal', () => {
        expect(
            featureFilter(['literal', true], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(true);
        expect(
            featureFilter(['literal', false], 'layers[0].filter').filter(undefined, undefined)
        ).toBe(false);
    });

    test('expression, match', () => {
        const match = featureFilter(
            ['match', ['get', 'x'], ['a', 'b', 'c'], true, false],
            'layers[0].filter'
        ).filter;
        expect(match(undefined, {properties: {x: 'a'}} as any as Feature)).toBe(true);
        expect(match(undefined, {properties: {x: 'c'}} as any as Feature)).toBe(true);
        expect(match(undefined, {properties: {x: 'd'}} as any as Feature)).toBe(false);
    });

    test('expression, type error', () => {
        expect(() => {
            featureFilter(
                ['==', ['number', ['get', 'x']], ['string', ['get', 'y']]],
                'layers[0].filter'
            );
        }).toThrow(": Cannot compare types 'number' and 'string'.");

        expect(() => {
            featureFilter(['number', ['get', 'x']], 'layers[0].filter');
        }).toThrow(': Expected boolean but found number instead.');

        expect(() => {
            featureFilter(['boolean', ['get', 'x']], 'layers[0].filter');
        }).not.toThrow();
    });

    test('expression, within', () => {
        const withinFilter = featureFilter(
            [
                'within',
                {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [5, 0],
                            [5, 5],
                            [0, 5],
                            [0, 0]
                        ]
                    ]
                }
            ],
            'layers[0].filter'
        );
        expect(withinFilter.needGeometry).toBe(true);
        const canonical = {z: 3, x: 3, y: 3} as ICanonicalTileID;
        const featureInTile = {} as Feature;
        getGeometry(featureInTile, {type: 'Point', coordinates: [2, 2]}, canonical);
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(true);
        getGeometry(featureInTile, {type: 'Point', coordinates: [6, 6]}, canonical);
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(false);
        getGeometry(featureInTile, {type: 'Point', coordinates: [5, 5]}, canonical);
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(false);
        getGeometry(
            featureInTile,
            {
                type: 'LineString',
                coordinates: [
                    [2, 2],
                    [3, 3]
                ]
            },
            canonical
        );
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(true);
        getGeometry(
            featureInTile,
            {
                type: 'LineString',
                coordinates: [
                    [6, 6],
                    [2, 2]
                ]
            },
            canonical
        );
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(false);
        getGeometry(
            featureInTile,
            {
                type: 'LineString',
                coordinates: [
                    [5, 5],
                    [2, 2]
                ]
            },
            canonical
        );
        expect(withinFilter.filter({zoom: 3}, featureInTile, canonical)).toBe(false);
    });

    test('expression, global-state', () => {
        const {filter} = featureFilter(
            ['==', ['global-state', 'x'], ['get', 'x']],
            'layers[0].filter',
            {x: 1}
        );
        expect(filter(undefined, {properties: {x: 1}} as any as Feature)).toBe(true);
        expect(filter(undefined, {properties: {x: 2}} as any as Feature)).toBe(false);
    });
});

describe('getGlobalStateRefs', () => {
    test('returns global-state keys', () => {
        const filter = featureFilter(['==', ['global-state', 'x'], ['zoom']], 'layers[0].filter');
        expect(filter.getGlobalStateRefs()).toEqual(new Set(['x']));
    });
});

describe('legacy filter detection', () => {
    test('definitely legacy filters', () => {
        // Expressions with more than two arguments.
        expect(isExpressionFilter(['in', 'color', 'red', 'blue'])).toBeFalsy();

        // Expressions where the second argument is not a string or array.
        expect(isExpressionFilter(['in', 'value', 42])).toBeFalsy();
        expect(isExpressionFilter(['in', 'value', true])).toBeFalsy();
    });

    test('ambiguous value', () => {
        // Should err on the side of reporting as a legacy filter. Style authors can force filters
        // by using a literal expression as the first argument.
        expect(isExpressionFilter(['in', 'color', 'red'])).toBeFalsy();
    });

    test('definitely expressions', () => {
        expect(isExpressionFilter(['in', ['get', 'color'], 'reddish'])).toBeTruthy();
        expect(isExpressionFilter(['in', ['get', 'color'], ['red', 'blue']])).toBeTruthy();
        expect(isExpressionFilter(['in', 42, 42])).toBeTruthy();
        expect(isExpressionFilter(['in', true, true])).toBeTruthy();
        expect(isExpressionFilter(['in', 'red', ['get', 'colors']])).toBeTruthy();
    });
});

describe('convert legacy filters to expressions', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    test('mimic legacy type mismatch semantics', () => {
        const filter = [
            'any',
            ['all', ['>', 'y', 0], ['>', 'y', 0]],
            ['>', 'x', 0]
        ] as FilterSpecification;

        const converted = convertFilter(filter);
        const f = featureFilter(converted, 'layers[0].filter').filter;

        expect(f({zoom: 0}, {properties: {x: 0, y: 1, z: 1}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: 1, y: 0, z: 1}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: 0, y: 0, z: 1}} as any as Feature)).toBe(false);
        expect(f({zoom: 0}, {properties: {x: null, y: 1, z: 1}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: 1, y: null, z: 1}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {x: null, y: null, z: 1}} as any as Feature)).toBe(false);
    });

    test('flattens nested, single child all expressions', () => {
        const filter: FilterSpecification = [
            'all',
            ['in', '$type', 'Polygon', 'LineString', 'Point'],
            ['all', ['in', 'type', 'island']]
        ];

        const expected: FilterSpecification = [
            'all',
            ['match', ['geometry-type'], ['LineString', 'Point', 'Polygon'], true, false],
            ['match', ['get', 'type'], ['island'], true, false]
        ];

        const converted = convertFilter(filter);
        expect(converted).toEqual(expected);
    });

    test('removes duplicates when outputting match expressions', () => {
        const filter = ['in', '$id', 1, 2, 3, 2, 1] as FilterSpecification;

        const expected = ['match', ['id'], [1, 2, 3], true, false];

        const converted = convertFilter(filter);
        expect(converted).toEqual(expected);
    });
});

describe('legacy filter tests', () => {
    for (const createFilterExpr of [
        (f?: FilterSpecification) => featureFilter(f, 'layers[0].filter'),
        (f?: FilterSpecification) => featureFilter(convertFilter(f), 'layers[0].filter')
    ]) {
        test('degenerate', () => {
            expect((createFilterExpr() as any).filter()).toBe(true);
            expect((createFilterExpr(undefined) as any).filter()).toBe(true);
            expect((createFilterExpr(null) as any).filter()).toBe(true);
        });

        test('==, string', () => {
            const f = createFilterExpr(['==', 'foo', 'bar']).filter;
            expect(f({zoom: 0}, {properties: {foo: 'bar'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 'baz'}} as any as Feature)).toBe(false);
        });

        test('==, number', () => {
            const f = createFilterExpr(['==', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('==, null', () => {
            const f = createFilterExpr(['==', 'foo', null]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            // t.equal(f({zoom: 0}, {properties: {foo: undefined}}), false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('==, $type', () => {
            const f = createFilterExpr(['==', '$type', 'LineString']).filter;
            expect(f({zoom: 0}, {type: 1} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {type: 2} as any as Feature)).toBe(true);
        });

        test('==, $id', () => {
            const f = createFilterExpr(['==', '$id', 1234]).filter;

            expect(f({zoom: 0}, {id: 1234} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {id: '1234'} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {id: 1234}} as any as Feature)).toBe(false);
        });

        test('!=, string', () => {
            const f = createFilterExpr(['!=', 'foo', 'bar']).filter;
            expect(f({zoom: 0}, {properties: {foo: 'bar'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 'baz'}} as any as Feature)).toBe(true);
        });

        test('!=, number', () => {
            const f = createFilterExpr(['!=', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(true);
        });

        test('!=, null', () => {
            const f = createFilterExpr(['!=', 'foo', null]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            // t.equal(f({zoom: 0}, {properties: {foo: undefined}}), true);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(true);
        });

        test('!=, $type', () => {
            const f = createFilterExpr(['!=', '$type', 'LineString']).filter;
            expect(f({zoom: 0}, {type: 1} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {type: 2} as any as Feature)).toBe(false);
        });

        test('<, number', () => {
            const f = createFilterExpr(['<', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('<, string', () => {
            const f = createFilterExpr(['<', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
        });

        test('<=, number', () => {
            const f = createFilterExpr(['<=', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('<=, string', () => {
            const f = createFilterExpr(['<=', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
        });

        test('>, number', () => {
            const f = createFilterExpr(['>', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('>, string', () => {
            const f = createFilterExpr(['>', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
        });

        test('>=, number', () => {
            const f = createFilterExpr(['>=', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('>=, string', () => {
            const f = createFilterExpr(['>=', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: -1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '1'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '-1'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
        });

        test('in, degenerate', () => {
            const f = createFilterExpr(['in', 'foo']).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
        });

        test('in, string', () => {
            const f = createFilterExpr(['in', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('in, number', () => {
            const f = createFilterExpr(['in', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
        });

        test('in, null', () => {
            const f = createFilterExpr(['in', 'foo', null]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            // t.equal(f({zoom: 0}, {properties: {foo: undefined}}), false);
        });

        test('in, multiple', () => {
            const f = createFilterExpr(['in', 'foo', 0, 1]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 3}} as any as Feature)).toBe(false);
        });

        test('in, large_multiple', () => {
            const values = Array.from({length: 2000}).map(Number.call, Number);
            values.reverse();
            const f = createFilterExpr(
                ['in', 'foo'].concat(values) as any as FilterSpecification
            ).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1999}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 2000}} as any as Feature)).toBe(false);
        });

        test('in, large_multiple, heterogeneous', () => {
            const values = Array.from({length: 2000}).map(Number.call, Number);
            values.push('a');
            values.unshift('b');
            const f = createFilterExpr(
                ['in', 'foo'].concat(values) as any as FilterSpecification
            ).filter;
            expect(f({zoom: 0}, {properties: {foo: 'b'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 'a'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1999}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 2000}} as any as Feature)).toBe(false);
        });

        test('in, $type', () => {
            const f = createFilterExpr(['in', '$type', 'LineString', 'Polygon']).filter;
            expect(f({zoom: 0}, {type: 1} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {type: 2} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {type: 3} as any as Feature)).toBe(true);

            const f1 = createFilterExpr(['in', '$type', 'Polygon', 'LineString', 'Point']).filter;
            expect(f1({zoom: 0}, {type: 1} as any as Feature)).toBe(true);
            expect(f1({zoom: 0}, {type: 2} as any as Feature)).toBe(true);
            expect(f1({zoom: 0}, {type: 3} as any as Feature)).toBe(true);
        });

        test('!in, degenerate', () => {
            const f = createFilterExpr(['!in', 'foo']).filter;
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
        });

        test('!in, string', () => {
            const f = createFilterExpr(['!in', 'foo', '0']).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(true);
        });

        test('!in, number', () => {
            const f = createFilterExpr(['!in', 'foo', 0]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(true);
        });

        test('!in, null', () => {
            const f = createFilterExpr(['!in', 'foo', null]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            // t.equal(f({zoom: 0}, {properties: {foo: undefined}}), true);
        });

        test('!in, multiple', () => {
            const f = createFilterExpr(['!in', 'foo', 0, 1]).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 3}} as any as Feature)).toBe(true);
        });

        test('!in, large_multiple', () => {
            const f = createFilterExpr(
                ['!in', 'foo'].concat(
                    Array.from({length: 2000}).map(Number.call, Number)
                ) as any as FilterSpecification
            ).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1999}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 2000}} as any as Feature)).toBe(true);
        });

        test('!in, $type', () => {
            const f = createFilterExpr(['!in', '$type', 'LineString', 'Polygon']).filter;
            expect(f({zoom: 0}, {type: 1} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {type: 2} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {type: 3} as any as Feature)).toBe(false);
        });

        test('any', () => {
            const f1 = createFilterExpr(['any']).filter;
            expect(f1({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);

            const f2 = createFilterExpr(['any', ['==', 'foo', 1]]).filter;
            expect(f2({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);

            const f3 = createFilterExpr(['any', ['==', 'foo', 0]]).filter;
            expect(f3({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);

            const f4 = createFilterExpr(['any', ['==', 'foo', 0], ['==', 'foo', 1]]).filter;
            expect(f4({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
        });

        test('all', () => {
            const f1 = createFilterExpr(['all']).filter;
            expect(f1({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);

            const f2 = createFilterExpr(['all', ['==', 'foo', 1]]).filter;
            expect(f2({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);

            const f3 = createFilterExpr(['all', ['==', 'foo', 0]]).filter;
            expect(f3({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);

            const f4 = createFilterExpr(['all', ['==', 'foo', 0], ['==', 'foo', 1]]).filter;
            expect(f4({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
        });

        test('none', () => {
            const f1 = createFilterExpr(['none']).filter;
            expect(f1({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);

            const f2 = createFilterExpr(['none', ['==', 'foo', 1]]).filter;
            expect(f2({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);

            const f3 = createFilterExpr(['none', ['==', 'foo', 0]]).filter;
            expect(f3({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);

            const f4 = createFilterExpr(['none', ['==', 'foo', 0], ['==', 'foo', 1]]).filter;
            expect(f4({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
        });

        test('has', () => {
            const f = createFilterExpr(['has', 'foo']).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: true}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(true);
            // null is a valid JSON value, property exists
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(true);
            // undefined means the property was never set, treated as absent
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(false);
        });

        test('!has', () => {
            const f = createFilterExpr(['!has', 'foo']).filter;
            expect(f({zoom: 0}, {properties: {foo: 0}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: 1}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: '0'}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            expect(f({zoom: 0}, {properties: {foo: false}} as any as Feature)).toBe(false);
            // null is a valid JSON value, property exists
            expect(f({zoom: 0}, {properties: {foo: null}} as any as Feature)).toBe(false);
            // undefined means the property was never set, treated as absent
            expect(f({zoom: 0}, {properties: {foo: undefined}} as any as Feature)).toBe(true);
            expect(f({zoom: 0}, {properties: {}} as any as Feature)).toBe(true);
        });

        test('pure legacy filter using `has` still matches the right features', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            warn.mockClear();

            const filter = [
                'all',
                ['==', '$type', 'LineString'],
                ['all', ['==', 'class', 'rail'], ['has', 'service']]
            ] as unknown as FilterSpecification;
            const f = createFilterExpr(filter).filter;

            expect(warn).not.toHaveBeenCalled();

            const feature = (properties: Record<string, string>) =>
                ({type: 'LineString', properties}) as any as Feature;
            expect(f({zoom: 0}, feature({class: 'rail', service: 'yard'}))).toBe(true);
            expect(f({zoom: 0}, feature({class: 'rail'}))).toBe(false);
            expect(f({zoom: 0}, feature({class: 'road', service: 'yard'}))).toBe(false);
        });
    }
});

describe('global-state in filter', () => {
    test('basic global-state equality filter', () => {
        const globalState = {activeId: 'track1'};
        const ff = featureFilter(
            ['==', ['get', 'id'], ['global-state', 'activeId']] as ExpressionFilterSpecification,
            'layers[0].filter',
            globalState
        );
        const f = ff.filter;

        expect(ff.getGlobalStateRefs()).toEqual(new Set(['activeId']));
        expect(f({zoom: 0}, {properties: {id: 'track1'}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {id: 'track2'}} as any as Feature)).toBe(false);
    });

    test('global-state filter updates reactively when state is mutated', () => {
        const globalState: Record<string, any> = {activeId: 'none'};
        const ff = featureFilter(
            ['==', ['get', 'id'], ['global-state', 'activeId']] as ExpressionFilterSpecification,
            'layers[0].filter',
            globalState
        );
        const f = ff.filter;

        // Initially no match
        expect(f({zoom: 0}, {properties: {id: 'track1'}} as any as Feature)).toBe(false);

        // Mutate global state (simulates setGlobalStateProperty)
        globalState.activeId = 'track1';

        // Filter should now match
        expect(f({zoom: 0}, {properties: {id: 'track1'}} as any as Feature)).toBe(true);
        expect(f({zoom: 0}, {properties: {id: 'track2'}} as any as Feature)).toBe(false);
    });

    test('global-state in case filter expression', () => {
        const globalState = {activeId: 'track1'};
        const isActive = [
            '==',
            ['get', 'id'],
            ['global-state', 'activeId']
        ] as ExpressionFilterSpecification;
        const ff = featureFilter(
            [
                'case',
                isActive,
                true,
                ['any', ['==', ['get', 'role'], 'start'], ['==', ['get', 'role'], 'end']]
            ] as ExpressionFilterSpecification,
            'layers[0].filter',
            globalState
        );
        const f = ff.filter;

        // Active track: all roles pass
        expect(f({zoom: 0}, {properties: {id: 'track1', role: 'mid'}} as any as Feature)).toBe(
            true
        );
        expect(f({zoom: 0}, {properties: {id: 'track1', role: 'insert'}} as any as Feature)).toBe(
            true
        );
        expect(f({zoom: 0}, {properties: {id: 'track1', role: 'start'}} as any as Feature)).toBe(
            true
        );

        // Inactive track: only start/end pass
        expect(f({zoom: 0}, {properties: {id: 'track2', role: 'mid'}} as any as Feature)).toBe(
            false
        );
        expect(f({zoom: 0}, {properties: {id: 'track2', role: 'insert'}} as any as Feature)).toBe(
            false
        );
        expect(f({zoom: 0}, {properties: {id: 'track2', role: 'start'}} as any as Feature)).toBe(
            true
        );
        expect(f({zoom: 0}, {properties: {id: 'track2', role: 'end'}} as any as Feature)).toBe(
            true
        );
    });

    test('isExpressionFilter recognizes filters mixing $type with expression operators', () => {
        // This is the exact pattern from issue #1544:
        // ['all', ['==', '$type', 'Point'], ['case', isActive, true, fallback]]
        const isActive = [
            '==',
            ['get', 'id'],
            ['global-state', 'activeTrackId']
        ] as ExpressionFilterSpecification;
        const filter = [
            'all',
            ['==', '$type', 'Point'],
            [
                'case',
                isActive,
                true,
                ['any', ['==', ['get', 'role'], 'start'], ['==', ['get', 'role'], 'end']]
            ]
        ] as ExpressionFilterSpecification;

        // isExpressionFilter used to return false because ['==', '$type', 'Point']
        // looks like a legacy filter (3 args, no arrays), causing the whole filter
        // to be sent through convertFilter which silently mangles expression
        // operators before the explicit mixed-syntax diagnostic can run.
        expect(isExpressionFilter(filter)).toBe(true);
    });

    test('mixed filter warns about unsupported legacy special-key operators', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const filter = [
            'all',
            ['>', '$type', 'Point'],
            ['==', ['global-state', 'active'], true]
        ] as ExpressionFilterSpecification;

        expect(() => featureFilter(filter, 'layers[0].filter', {active: true})).not.toThrow();
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].filter[1]: "$type" cannot be use with operator ">"'
        );
    });

    test('none is never an expression, so it is always converted from legacy syntax', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const globalState = {activeTrackId: 'track1'};
        const isActive = [
            '==',
            ['get', 'id'],
            ['global-state', 'activeTrackId']
        ] as ExpressionFilterSpecification;
        const filter = [
            'none',
            ['==', '$type', 'Polygon'],
            ['case', isActive, true, false]
        ] as unknown as ExpressionFilterSpecification;

        expect(isExpressionFilter(filter)).toBe(false);
        expect(() => featureFilter(filter, 'layers[0].filter', globalState)).not.toThrow();
    });

    test('suggests a valid expression for mixed "$type" != filter', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const filter = [
            'all',
            ['!=', '$type', 'LineString'],
            ['==', ['global-state', 'active'], true]
        ] as unknown as ExpressionFilterSpecification;

        expect(() => featureFilter(filter, 'layers[0].filter', {active: true})).not.toThrow();
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].filter[1]: Mixing deprecated filter syntax with expression syntax is not supported. Replace ["!=","$type","LineString"] with ["!=",["geometry-type"],"LineString"].'
        );
    });
});

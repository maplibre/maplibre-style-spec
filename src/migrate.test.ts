import {migrate} from './migrate';
import * as spec from '.';
import v8 from './reference/v8.json' with {type: 'json'};
import {validateStyle} from './validate_style';
import {describe, test, expect} from 'vitest';
import type {StyleSpecification} from './types.g';

describe('migrate', () => {
    test('does not migrate from version 5', () => {
        expect(() => {
            migrate({version: 5, layers: []} as any);
        }).toThrowError('Cannot migrate from 5');
    });

    test('does not migrate from version 6', () => {
        expect(() => {
            migrate({version: 6, layers: []} as any);
        }).toThrowError('Cannot migrate from 6');
    });

    test('migrates to latest version from version 7', () => {
        expect(migrate({version: 7, layers: []} as any).version).toEqual(spec.latest.$version);
    });

    test('converts token strings to expressions', () => {
        const migrated = migrate({
            version: 8,
            layers: [
                {
                    id: '1',
                    type: 'symbol',
                    layout: {'text-field': 'a{x}', 'icon-image': '{y}'}
                }
            ]
        } as any);
        expect(migrated.layers[0].layout['text-field']).toEqual(['concat', 'a', ['get', 'x']]);
        expect(migrated.layers[0].layout['icon-image']).toEqual(['to-string', ['get', 'y']]);
    });

    test('converts stop functions to expressions', () => {
        const migrated = migrate({
            version: 8,
            layers: [
                {
                    id: '1',
                    type: 'background',
                    paint: {
                        'background-opacity': {
                            base: 1.0,
                            stops: [
                                [0, 1],
                                [10, 0.72]
                            ]
                        }
                    }
                },
                {
                    id: '2',
                    type: 'background',
                    paint: {
                        'background-opacity': {
                            base: 1.0,
                            stops: [
                                [0, [1, 2]],
                                [10, [0.72, 0.98]]
                            ]
                        }
                    }
                }
            ]
        } as any);
        expect(migrated.layers[0].paint['background-opacity']).toEqual([
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            10,
            0.72
        ]);
        expect(migrated.layers[1].paint['background-opacity']).toEqual([
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            ['literal', [1, 2]],
            10,
            ['literal', [0.72, 0.98]]
        ]);
    });

    test('converts categorical function on resolvedImage type to valid expression', () => {
        const migrated = migrate({
            version: 8,
            sources: {
                maplibre: {
                    url: 'https://demotiles.maplibre.org/tiles/tiles.json',
                    type: 'vector'
                }
            },
            layers: [
                {
                    id: '1',
                    source: 'maplibre',
                    'source-layer': 'labels',
                    type: 'symbol',
                    layout: {
                        'icon-image': {
                            base: 1,
                            type: 'categorical',
                            property: 'type',
                            stops: [['park', 'some-icon']]
                        }
                    }
                }
            ]
        } as any);
        expect(migrated.layers[0].layout['icon-image']).toEqual([
            'match',
            ['get', 'type'],
            'park',
            'some-icon',
            ''
        ]);
        expect(validateStyle(migrated, v8)).toEqual([]);
    });

    test('converts colors to supported format', () => {
        const migrated = migrate({
            version: 8,
            sources: {},
            layers: [
                {
                    id: '1',
                    type: 'fill',
                    source: 'vector',
                    paint: {
                        'fill-color': 'hsl(100,0.3,.2)',
                        'fill-outline-color': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0,
                            'hsl(110, 0.7, 0.055)',
                            10,
                            'hsla(330,0.85,50%)'
                        ]
                    }
                }
            ]
        });

        expect(migrated.layers[0].paint).toEqual({
            'fill-color': 'hsl(100,30%,20%)',
            'fill-outline-color': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                'hsl(110,70%,5.5%)',
                10,
                'hsl(330,85%,50%)'
            ]
        });
    });

    test('migrates successfully when style contains transition properties', () => {
        const style: StyleSpecification = {
            version: 8,
            sources: {},
            layers: [
                {
                    id: 'layer-with-transition',
                    type: 'symbol',
                    source: 'vector-source',
                    paint: {
                        'icon-color': 'hsl(100,0.3,.2)',
                        'icon-opacity-transition': {duration: 0}
                    }
                }
            ]
        };

        expect(() => migrate(style)).not.toThrowError();
        expect(style.layers[0].paint).toEqual({
            'icon-color': 'hsl(100,30%,20%)',
            'icon-opacity-transition': {duration: 0}
        });
    });
});

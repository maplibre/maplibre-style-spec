import {format} from './format';
import {describe, test, expect} from 'vitest';
function roundtrip(style) {
    return JSON.parse(format(style));
}

describe('format', () => {
    test('orders top-level keys', () => {
        expect(
            Object.keys(
                roundtrip({
                    layers: [],
                    other: {},
                    sources: {},
                    glyphs: '',
                    sprite: '',
                    version: 6
                })
            )
        ).toEqual(['version', 'sources', 'sprite', 'glyphs', 'layers', 'other']);
    });

    test('orders layer keys', () => {
        expect(
            Object.keys(
                roundtrip({
                    layers: [
                        {
                            paint: {},
                            layout: {},
                            id: 'id',
                            type: 'type'
                        }
                    ]
                }).layers[0]
            )
        ).toEqual(['id', 'type', 'layout', 'paint']);
    });

    test('uses a maximum line length of 80 by default', () => {
        const style = {
            version: 8,
            layers: [{id: 'bg', type: 'background', paint: {'background-color': '#fff'}}]
        };
        expect(format(style)).toBe(
            '{\n  "version": 8,\n  "layers": [\n    {"id": "bg", "type": "background", "paint": {"background-color": "#fff"}}\n  ]\n}'
        );
    });

    test('uses the given maximum line length', () => {
        const style = {
            version: 8,
            layers: [{id: 'bg', type: 'background', paint: {'background-color': '#fff'}}]
        };
        expect(format(style, 2, 50)).toBe(
            '{\n  "version": 8,\n  "layers": [\n    {\n      "id": "bg",\n      "type": "background",\n      "paint": {"background-color": "#fff"}\n    }\n  ]\n}'
        );
    });
});

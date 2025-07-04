import Reference from './reference/v8.json' with {type: 'json'};
import type {StylePropertySpecification} from '.';
import type {
    StyleSpecification,
    SourceSpecification,
    LayerSpecification,
    PropertyValueSpecification,
    DataDrivenPropertyValueSpecification
} from './types.g';

function getPropertyReference(propertyName: string): StylePropertySpecification | null {
    for (let i = 0; i < Reference.layout.length; i++) {
        for (const key in Reference[Reference.layout[i]]) {
            if (key === propertyName) return Reference[Reference.layout[i]][key];
        }
    }
    for (let i = 0; i < Reference.paint.length; i++) {
        for (const key in Reference[Reference.paint[i]]) {
            if (key === propertyName) return Reference[Reference.paint[i]][key];
        }
    }

    return null;
}

export function eachSource(style: StyleSpecification, callback: (_: SourceSpecification) => void) {
    for (const k in style.sources) {
        callback(style.sources[k]);
    }
}

export function eachLayer(style: StyleSpecification, callback: (_: LayerSpecification) => void) {
    for (const layer of style.layers) {
        callback(layer);
    }
}

type PropertyCallback = (
    a: {
        path: [string, 'paint' | 'layout', string]; // [layerid, paint/layout, property key],
        key: string;
        value: PropertyValueSpecification<unknown> | DataDrivenPropertyValueSpecification<unknown>;
        reference: StylePropertySpecification | null;
        set: (
            a: PropertyValueSpecification<unknown> | DataDrivenPropertyValueSpecification<unknown>
        ) => void;
    }
) => void;

export function eachProperty(
    style: StyleSpecification,
    options: {
        paint?: boolean;
        layout?: boolean;
    },
    callback: PropertyCallback
) {
    function inner(layer: LayerSpecification, propertyType: 'paint' | 'layout') {
        const properties = layer[propertyType];
        if (!properties) return;
        Object.keys(properties).forEach((key) => {
            callback({
                path: [layer.id, propertyType, key],
                key,
                value: properties[key],
                reference: getPropertyReference(key),
                set(x) {
                    properties[key] = x;
                }
            });
        });
    }

    eachLayer(style, (layer) => {
        if (options.paint) {
            inner(layer, 'paint');
        }
        if (options.layout) {
            inner(layer, 'layout');
        }
    });
}

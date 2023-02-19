import Reference from './reference/v8.json' assert { type: 'json' };
function getPropertyReference(propertyName) {
    for (let i = 0; i < Reference.layout.length; i++) {
        for (const key in Reference[Reference.layout[i]]) {
            if (key === propertyName)
                return Reference[Reference.layout[i]][key];
        }
    }
    for (let i = 0; i < Reference.paint.length; i++) {
        for (const key in Reference[Reference.paint[i]]) {
            if (key === propertyName)
                return Reference[Reference.paint[i]][key];
        }
    }
    return null;
}
export function eachSource(style, callback) {
    for (const k in style.sources) {
        callback(style.sources[k]);
    }
}
export function eachLayer(style, callback) {
    for (const layer of style.layers) {
        callback(layer);
    }
}
export function eachProperty(style, options, callback) {
    function inner(layer, propertyType) {
        const properties = layer[propertyType];
        if (!properties)
            return;
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
//# sourceMappingURL=visit.js.map
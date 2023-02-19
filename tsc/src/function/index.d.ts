export declare function isFunction(value: any): boolean;
export declare function createFunction(parameters: any, propertySpec: any): {
    kind: string;
    interpolationType: {
        name: string;
    };
    interpolationFactor: any;
    zoomStops: any[];
    evaluate({ zoom }: {
        zoom: any;
    }, properties: any): any;
} | {
    kind: string;
    interpolationType: {
        name: string;
        base: any;
    };
    interpolationFactor: any;
    zoomStops: any;
    evaluate: ({ zoom }: {
        zoom: any;
    }) => any;
} | {
    kind: string;
    evaluate(_: any, feature: any): any;
    interpolationType?: undefined;
    interpolationFactor?: undefined;
    zoomStops?: undefined;
};

export type ColorSpecification = string;
export type PaddingSpecification = number | number[];
export type SpriteSpecification = string | {
    id: string;
    url: string;
}[];
export type FormattedSpecification = string;
export type ResolvedImageSpecification = string;
export type PromoteIdSpecification = {
    [_: string]: string;
} | string;
export type ExpressionInputType = string | number | boolean;
export type CollatorExpressionSpecification = [
    'collator',
    {
        'case-sensitive'?: boolean | ExpressionSpecification;
        'diacritic-sensitive'?: boolean | ExpressionSpecification;
        locale?: string | ExpressionSpecification;
    }
];
export type InterpolationSpecification = ['linear'] | ['exponential', number | ExpressionSpecification] | ['cubic-bezier', number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification];
export type ExpressionSpecification = ['array', unknown | ExpressionSpecification] | ['array', ExpressionInputType | ExpressionSpecification, unknown | ExpressionSpecification] | ['array', ExpressionInputType | ExpressionSpecification, number | ExpressionSpecification, unknown | ExpressionSpecification] | ['boolean', ...(unknown | ExpressionSpecification)[], unknown | ExpressionSpecification] | CollatorExpressionSpecification | ['format', ...(string | ['image', ExpressionSpecification] | ExpressionSpecification | {
    'font-scale'?: number | ExpressionSpecification;
    'text-font'?: string[] | ExpressionSpecification;
    'text-color': ColorSpecification | ExpressionSpecification;
})[]] | ['image', unknown | ExpressionSpecification] | ['literal', unknown] | ['number', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] | ['number-format', number | ExpressionSpecification, {
    'locale'?: string | ExpressionSpecification;
    'currency'?: string | ExpressionSpecification;
    'min-fraction-digits'?: number | ExpressionSpecification;
    'max-fraction-digits'?: number | ExpressionSpecification;
}] | ['object', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] | ['string', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] | ['to-boolean', unknown | ExpressionSpecification] | ['to-color', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] | ['to-number', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] | ['to-string', unknown | ExpressionSpecification] | ['accumulated'] | ['feature-state', string] | ['geometry-type'] | ['id'] | ['line-progress'] | ['properties'] | ['at', number | ExpressionSpecification, ExpressionSpecification] | ['get', string | ExpressionSpecification, (Record<string, unknown> | ExpressionSpecification)?] | ['has', string | ExpressionSpecification, (Record<string, unknown> | ExpressionSpecification)?] | ['in', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification] | ['index-of', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification] | ['length', string | ExpressionSpecification] | ['slice', string | ExpressionSpecification, number | ExpressionSpecification, (number | ExpressionSpecification)?] | ['!', boolean | ExpressionSpecification] | ['!=', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['<', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['<=', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['==', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['>', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['>=', ExpressionInputType | ExpressionSpecification, ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] | ['all', ...(boolean | ExpressionSpecification)[]] | ['any', ...(boolean | ExpressionSpecification)[]] | [
    'case',
    boolean | ExpressionSpecification,
    ExpressionInputType | ExpressionSpecification,
    ...(boolean | ExpressionInputType | ExpressionSpecification)[],
    ExpressionInputType | ExpressionSpecification
] | ['coalesce', ...(ExpressionInputType | ExpressionSpecification)[]] | [
    'match',
    ExpressionInputType | ExpressionSpecification,
    ExpressionInputType | ExpressionInputType[],
    ExpressionInputType | ExpressionSpecification,
    ...(ExpressionInputType | ExpressionInputType[] | ExpressionSpecification)[],
    // repeated as above
    ExpressionInputType | ExpressionSpecification
] | ['within', unknown | ExpressionSpecification] | [
    'interpolate',
    InterpolationSpecification,
    number | ExpressionSpecification,
    ...(number | number[] | ColorSpecification | ExpressionSpecification)[]
] | [
    'interpolate-hcl',
    InterpolationSpecification,
    number | ExpressionSpecification,
    ...(number | ColorSpecification)[]
] | [
    'interpolate-lab',
    InterpolationSpecification,
    number | ExpressionSpecification,
    ...(number | ColorSpecification)[]
] | [
    'step',
    number | ExpressionSpecification,
    ExpressionInputType | ExpressionSpecification,
    ...(number | ExpressionInputType | ExpressionSpecification)[]
] | ['let', string, ExpressionInputType | ExpressionSpecification, ...(string | ExpressionInputType | ExpressionSpecification)[]] | ['var', string] | ['concat', ...(ExpressionInputType | ExpressionSpecification)[]] | ['downcase', string | ExpressionSpecification] | ['is-supported-script', string | ExpressionSpecification] | ['resolved-locale', CollatorExpressionSpecification] | ['upcase', string | ExpressionSpecification] | ['rgb', number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification] | ['rgba', number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification] | ['to-rgba', ColorSpecification | ExpressionSpecification] | ['-', number | ExpressionSpecification, (number | ExpressionSpecification)?] | ['*', number | ExpressionSpecification, number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] | ['/', number | ExpressionSpecification, number | ExpressionSpecification] | ['%', number | ExpressionSpecification, number | ExpressionSpecification] | ['^', number | ExpressionSpecification, number | ExpressionSpecification] | ['+', ...(number | ExpressionSpecification)[]] | ['abs', number | ExpressionSpecification] | ['acos', number | ExpressionSpecification] | ['asin', number | ExpressionSpecification] | ['atan', number | ExpressionSpecification] | ['ceil', number | ExpressionSpecification] | ['cos', number | ExpressionSpecification] | ['distance', Record<string, unknown> | ExpressionSpecification] | ['ExpressionSpecification'] | ['floor', number | ExpressionSpecification] | ['ln', number | ExpressionSpecification] | ['ln2'] | ['log10', number | ExpressionSpecification] | ['log2', number | ExpressionSpecification] | ['max', number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] | ['min', number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] | ['pi'] | ['round', number | ExpressionSpecification] | ['sin', number | ExpressionSpecification] | ['sqrt', number | ExpressionSpecification] | ['tan', number | ExpressionSpecification] | ['zoom'] | ['heatmap-density'];
export type ExpressionFilterSpecification = boolean | ExpressionSpecification;
export type LegacyFilterSpecification = ['has', string] | ['!has', string] | ['==', string, string | number | boolean] | ['!=', string, string | number | boolean] | ['>', string, string | number | boolean] | ['>=', string, string | number | boolean] | ['<', string, string | number | boolean] | ['<=', string, string | number | boolean] | ['in', string, ...(string | number | boolean)[]] | ['!in', string, ...(string | number | boolean)[]] | ['all', ...LegacyFilterSpecification[]] | ['any', ...LegacyFilterSpecification[]] | ['none', ...LegacyFilterSpecification[]];
export type FilterSpecification = ExpressionFilterSpecification | LegacyFilterSpecification;
export type TransitionSpecification = {
    duration?: number;
    delay?: number;
};
export type CameraFunctionSpecification<T> = {
    type: 'exponential';
    stops: Array<[number, T]>;
} | {
    type: 'interval';
    stops: Array<[number, T]>;
};
export type SourceFunctionSpecification<T> = {
    type: 'exponential';
    stops: Array<[number, T]>;
    property: string;
    default?: T;
} | {
    type: 'interval';
    stops: Array<[number, T]>;
    property: string;
    default?: T;
} | {
    type: 'categorical';
    stops: Array<[string | number | boolean, T]>;
    property: string;
    default?: T;
} | {
    type: 'identity';
    property: string;
    default?: T;
};
export type CompositeFunctionSpecification<T> = {
    type: 'exponential';
    stops: Array<[{
        zoom: number;
        value: number;
    }, T]>;
    property: string;
    default?: T;
} | {
    type: 'interval';
    stops: Array<[{
        zoom: number;
        value: number;
    }, T]>;
    property: string;
    default?: T;
} | {
    type: 'categorical';
    stops: Array<[{
        zoom: number;
        value: string | number | boolean;
    }, T]>;
    property: string;
    default?: T;
};
export type PropertyValueSpecification<T> = T | CameraFunctionSpecification<T> | ExpressionSpecification;
export type DataDrivenPropertyValueSpecification<T> = T | CameraFunctionSpecification<T> | SourceFunctionSpecification<T> | CompositeFunctionSpecification<T> | ExpressionSpecification;
export type StyleSpecification = {
    "version": 8;
    "name"?: string;
    "metadata"?: unknown;
    "center"?: Array<number>;
    "zoom"?: number;
    "bearing"?: number;
    "pitch"?: number;
    "light"?: LightSpecification;
    "terrain"?: TerrainSpecification;
    "sources": {
        [_: string]: SourceSpecification;
    };
    "sprite"?: SpriteSpecification;
    "glyphs"?: string;
    "transition"?: TransitionSpecification;
    "layers": Array<LayerSpecification>;
};
export type LightSpecification = {
    "anchor"?: PropertyValueSpecification<"map" | "viewport">;
    "position"?: PropertyValueSpecification<[number, number, number]>;
    "color"?: PropertyValueSpecification<ColorSpecification>;
    "intensity"?: PropertyValueSpecification<number>;
};
export type TerrainSpecification = {
    "source": string;
    "exaggeration"?: number;
};
export type VectorSourceSpecification = {
    "type": "vector";
    "url"?: string;
    "tiles"?: Array<string>;
    "bounds"?: [number, number, number, number];
    "scheme"?: "xyz" | "tms";
    "minzoom"?: number;
    "maxzoom"?: number;
    "attribution"?: string;
    "promoteId"?: PromoteIdSpecification;
    "volatile"?: boolean;
};
export type RasterSourceSpecification = {
    "type": "raster";
    "url"?: string;
    "tiles"?: Array<string>;
    "bounds"?: [number, number, number, number];
    "minzoom"?: number;
    "maxzoom"?: number;
    "tileSize"?: number;
    "scheme"?: "xyz" | "tms";
    "attribution"?: string;
    "volatile"?: boolean;
};
export type RasterDEMSourceSpecification = {
    "type": "raster-dem";
    "url"?: string;
    "tiles"?: Array<string>;
    "bounds"?: [number, number, number, number];
    "minzoom"?: number;
    "maxzoom"?: number;
    "tileSize"?: number;
    "attribution"?: string;
    "encoding"?: "terrarium" | "mapbox";
    "volatile"?: boolean;
};
export type GeoJSONSourceSpecification = {
    "type": "geojson";
    "data": unknown;
    "maxzoom"?: number;
    "attribution"?: string;
    "buffer"?: number;
    "filter"?: unknown;
    "tolerance"?: number;
    "cluster"?: boolean;
    "clusterRadius"?: number;
    "clusterMaxZoom"?: number;
    "clusterMinPoints"?: number;
    "clusterProperties"?: unknown;
    "lineMetrics"?: boolean;
    "generateId"?: boolean;
    "promoteId"?: PromoteIdSpecification;
};
export type VideoSourceSpecification = {
    "type": "video";
    "urls": Array<string>;
    "coordinates": [[number, number], [number, number], [number, number], [number, number]];
};
export type ImageSourceSpecification = {
    "type": "image";
    "url": string;
    "coordinates": [[number, number], [number, number], [number, number], [number, number]];
};
export type SourceSpecification = VectorSourceSpecification | RasterSourceSpecification | RasterDEMSourceSpecification | GeoJSONSourceSpecification | VideoSourceSpecification | ImageSourceSpecification;
export type FillLayerSpecification = {
    "id": string;
    "type": "fill";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "fill-sort-key"?: DataDrivenPropertyValueSpecification<number>;
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "fill-antialias"?: PropertyValueSpecification<boolean>;
        "fill-opacity"?: DataDrivenPropertyValueSpecification<number>;
        "fill-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "fill-outline-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "fill-translate"?: PropertyValueSpecification<[number, number]>;
        "fill-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "fill-pattern"?: DataDrivenPropertyValueSpecification<ResolvedImageSpecification>;
    };
};
export type LineLayerSpecification = {
    "id": string;
    "type": "line";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "line-cap"?: PropertyValueSpecification<"butt" | "round" | "square">;
        "line-join"?: DataDrivenPropertyValueSpecification<"bevel" | "round" | "miter">;
        "line-miter-limit"?: PropertyValueSpecification<number>;
        "line-round-limit"?: PropertyValueSpecification<number>;
        "line-sort-key"?: DataDrivenPropertyValueSpecification<number>;
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "line-opacity"?: DataDrivenPropertyValueSpecification<number>;
        "line-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "line-translate"?: PropertyValueSpecification<[number, number]>;
        "line-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "line-width"?: DataDrivenPropertyValueSpecification<number>;
        "line-gap-width"?: DataDrivenPropertyValueSpecification<number>;
        "line-offset"?: DataDrivenPropertyValueSpecification<number>;
        "line-blur"?: DataDrivenPropertyValueSpecification<number>;
        "line-dasharray"?: PropertyValueSpecification<Array<number>>;
        "line-pattern"?: DataDrivenPropertyValueSpecification<ResolvedImageSpecification>;
        "line-gradient"?: ExpressionSpecification;
    };
};
export type SymbolLayerSpecification = {
    "id": string;
    "type": "symbol";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "symbol-placement"?: PropertyValueSpecification<"point" | "line" | "line-center">;
        "symbol-spacing"?: PropertyValueSpecification<number>;
        "symbol-avoid-edges"?: PropertyValueSpecification<boolean>;
        "symbol-sort-key"?: DataDrivenPropertyValueSpecification<number>;
        "symbol-z-order"?: PropertyValueSpecification<"auto" | "viewport-y" | "source">;
        "icon-allow-overlap"?: PropertyValueSpecification<boolean>;
        "icon-overlap"?: PropertyValueSpecification<"never" | "always" | "cooperative">;
        "icon-ignore-placement"?: PropertyValueSpecification<boolean>;
        "icon-optional"?: PropertyValueSpecification<boolean>;
        "icon-rotation-alignment"?: PropertyValueSpecification<"map" | "viewport" | "auto">;
        "icon-size"?: DataDrivenPropertyValueSpecification<number>;
        "icon-text-fit"?: PropertyValueSpecification<"none" | "width" | "height" | "both">;
        "icon-text-fit-padding"?: PropertyValueSpecification<[number, number, number, number]>;
        "icon-image"?: DataDrivenPropertyValueSpecification<ResolvedImageSpecification>;
        "icon-rotate"?: DataDrivenPropertyValueSpecification<number>;
        "icon-padding"?: DataDrivenPropertyValueSpecification<PaddingSpecification>;
        "icon-keep-upright"?: PropertyValueSpecification<boolean>;
        "icon-offset"?: DataDrivenPropertyValueSpecification<[number, number]>;
        "icon-anchor"?: DataDrivenPropertyValueSpecification<"center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right">;
        "icon-pitch-alignment"?: PropertyValueSpecification<"map" | "viewport" | "auto">;
        "text-pitch-alignment"?: PropertyValueSpecification<"map" | "viewport" | "auto">;
        "text-rotation-alignment"?: PropertyValueSpecification<"map" | "viewport" | "viewport-glyph" | "auto">;
        "text-field"?: DataDrivenPropertyValueSpecification<FormattedSpecification>;
        "text-font"?: DataDrivenPropertyValueSpecification<Array<string>>;
        "text-size"?: DataDrivenPropertyValueSpecification<number>;
        "text-max-width"?: DataDrivenPropertyValueSpecification<number>;
        "text-line-height"?: PropertyValueSpecification<number>;
        "text-letter-spacing"?: DataDrivenPropertyValueSpecification<number>;
        "text-justify"?: DataDrivenPropertyValueSpecification<"auto" | "left" | "center" | "right">;
        "text-radial-offset"?: DataDrivenPropertyValueSpecification<number>;
        "text-variable-anchor"?: PropertyValueSpecification<Array<"center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right">>;
        "text-anchor"?: DataDrivenPropertyValueSpecification<"center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right">;
        "text-max-angle"?: PropertyValueSpecification<number>;
        "text-writing-mode"?: PropertyValueSpecification<Array<"horizontal" | "vertical">>;
        "text-rotate"?: DataDrivenPropertyValueSpecification<number>;
        "text-padding"?: PropertyValueSpecification<number>;
        "text-keep-upright"?: PropertyValueSpecification<boolean>;
        "text-transform"?: DataDrivenPropertyValueSpecification<"none" | "uppercase" | "lowercase">;
        "text-offset"?: DataDrivenPropertyValueSpecification<[number, number]>;
        "text-allow-overlap"?: PropertyValueSpecification<boolean>;
        "text-overlap"?: PropertyValueSpecification<"never" | "always" | "cooperative">;
        "text-ignore-placement"?: PropertyValueSpecification<boolean>;
        "text-optional"?: PropertyValueSpecification<boolean>;
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "icon-opacity"?: DataDrivenPropertyValueSpecification<number>;
        "icon-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "icon-halo-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "icon-halo-width"?: DataDrivenPropertyValueSpecification<number>;
        "icon-halo-blur"?: DataDrivenPropertyValueSpecification<number>;
        "icon-translate"?: PropertyValueSpecification<[number, number]>;
        "icon-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "text-opacity"?: DataDrivenPropertyValueSpecification<number>;
        "text-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "text-halo-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "text-halo-width"?: DataDrivenPropertyValueSpecification<number>;
        "text-halo-blur"?: DataDrivenPropertyValueSpecification<number>;
        "text-translate"?: PropertyValueSpecification<[number, number]>;
        "text-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
    };
};
export type CircleLayerSpecification = {
    "id": string;
    "type": "circle";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "circle-sort-key"?: DataDrivenPropertyValueSpecification<number>;
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "circle-radius"?: DataDrivenPropertyValueSpecification<number>;
        "circle-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "circle-blur"?: DataDrivenPropertyValueSpecification<number>;
        "circle-opacity"?: DataDrivenPropertyValueSpecification<number>;
        "circle-translate"?: PropertyValueSpecification<[number, number]>;
        "circle-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "circle-pitch-scale"?: PropertyValueSpecification<"map" | "viewport">;
        "circle-pitch-alignment"?: PropertyValueSpecification<"map" | "viewport">;
        "circle-stroke-width"?: DataDrivenPropertyValueSpecification<number>;
        "circle-stroke-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "circle-stroke-opacity"?: DataDrivenPropertyValueSpecification<number>;
    };
};
export type HeatmapLayerSpecification = {
    "id": string;
    "type": "heatmap";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "heatmap-radius"?: DataDrivenPropertyValueSpecification<number>;
        "heatmap-weight"?: DataDrivenPropertyValueSpecification<number>;
        "heatmap-intensity"?: PropertyValueSpecification<number>;
        "heatmap-color"?: ExpressionSpecification;
        "heatmap-opacity"?: PropertyValueSpecification<number>;
    };
};
export type FillExtrusionLayerSpecification = {
    "id": string;
    "type": "fill-extrusion";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "fill-extrusion-opacity"?: PropertyValueSpecification<number>;
        "fill-extrusion-color"?: DataDrivenPropertyValueSpecification<ColorSpecification>;
        "fill-extrusion-translate"?: PropertyValueSpecification<[number, number]>;
        "fill-extrusion-translate-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "fill-extrusion-pattern"?: DataDrivenPropertyValueSpecification<ResolvedImageSpecification>;
        "fill-extrusion-height"?: DataDrivenPropertyValueSpecification<number>;
        "fill-extrusion-base"?: DataDrivenPropertyValueSpecification<number>;
        "fill-extrusion-vertical-gradient"?: PropertyValueSpecification<boolean>;
    };
};
export type RasterLayerSpecification = {
    "id": string;
    "type": "raster";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "raster-opacity"?: PropertyValueSpecification<number>;
        "raster-hue-rotate"?: PropertyValueSpecification<number>;
        "raster-brightness-min"?: PropertyValueSpecification<number>;
        "raster-brightness-max"?: PropertyValueSpecification<number>;
        "raster-saturation"?: PropertyValueSpecification<number>;
        "raster-contrast"?: PropertyValueSpecification<number>;
        "raster-resampling"?: PropertyValueSpecification<"linear" | "nearest">;
        "raster-fade-duration"?: PropertyValueSpecification<number>;
    };
};
export type HillshadeLayerSpecification = {
    "id": string;
    "type": "hillshade";
    "metadata"?: unknown;
    "source": string;
    "source-layer"?: string;
    "minzoom"?: number;
    "maxzoom"?: number;
    "filter"?: FilterSpecification;
    "layout"?: {
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "hillshade-illumination-direction"?: PropertyValueSpecification<number>;
        "hillshade-illumination-anchor"?: PropertyValueSpecification<"map" | "viewport">;
        "hillshade-exaggeration"?: PropertyValueSpecification<number>;
        "hillshade-shadow-color"?: PropertyValueSpecification<ColorSpecification>;
        "hillshade-highlight-color"?: PropertyValueSpecification<ColorSpecification>;
        "hillshade-accent-color"?: PropertyValueSpecification<ColorSpecification>;
    };
};
export type BackgroundLayerSpecification = {
    "id": string;
    "type": "background";
    "metadata"?: unknown;
    "minzoom"?: number;
    "maxzoom"?: number;
    "layout"?: {
        "visibility"?: "visible" | "none";
    };
    "paint"?: {
        "background-color"?: PropertyValueSpecification<ColorSpecification>;
        "background-pattern"?: PropertyValueSpecification<ResolvedImageSpecification>;
        "background-opacity"?: PropertyValueSpecification<number>;
    };
};
export type LayerSpecification = FillLayerSpecification | LineLayerSpecification | SymbolLayerSpecification | CircleLayerSpecification | HeatmapLayerSpecification | FillExtrusionLayerSpecification | RasterLayerSpecification | HillshadeLayerSpecification | BackgroundLayerSpecification;

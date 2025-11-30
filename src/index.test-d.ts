import {describe, expectTypeOf, test} from 'vitest';
import type {
    BackgroundLayerSpecification,
    CircleLayerSpecification,
    ColorReliefLayerSpecification,
    FillExtrusionLayerSpecification,
    FillLayerSpecification,
    HeatmapLayerSpecification,
    HillshadeLayerSpecification,
    LightSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SkySpecification,
    SymbolLayerSpecification
} from './types.g';

describe('style-spec', () => {
    test('LightSpecification contains *-transition keys for transitionable properties', () => {
        expectTypeOf<{'position-transition': {duration: 100}}>().toExtend<LightSpecification>();
        expectTypeOf<{'color-transition': {duration: 100}}>().toExtend<LightSpecification>();
        expectTypeOf<{
            'intensity-transition': {duration: 100};
        }>().toExtend<LightSpecification>();
    });
    test('LightSpecification does not contain *-transition keys for untransitionable properties', () => {
        expectTypeOf<{
            'anchor-transition': {duration: 100};
        }>().not.toExtend<LightSpecification>();
    });

    test('SkySpecification contains *-transition keys for transitionable properties', () => {
        expectTypeOf<{'sky-color-transition': {duration: 100}}>().toExtend<SkySpecification>();
        expectTypeOf<{
            'horizon-color-transition': {duration: 100};
        }>().toExtend<SkySpecification>();
        expectTypeOf<{'fog-color-transition': {duration: 100}}>().toExtend<SkySpecification>();
        expectTypeOf<{
            'fog-ground-blend-transition': {duration: 100};
        }>().toExtend<SkySpecification>();
        expectTypeOf<{
            'horizon-fog-blend-transition': {duration: 100};
        }>().toExtend<SkySpecification>();
        expectTypeOf<{
            'sky-horizon-blend-transition': {duration: 100};
        }>().toExtend<SkySpecification>();
        expectTypeOf<{
            'atmosphere-blend-transition': {duration: 100};
        }>().toExtend<SkySpecification>();
    });

    test('BackgroundLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'background-color-transition': {duration: 100}}>().toExtend<
            BackgroundLayerSpecification['paint']
        >();
        expectTypeOf<{'background-pattern-transition': {duration: 100}}>().toExtend<
            BackgroundLayerSpecification['paint']
        >();
        expectTypeOf<{'background-opacity-transition': {duration: 100}}>().toExtend<
            BackgroundLayerSpecification['paint']
        >();
    });

    test('CircleLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'circle-radius-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-color-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-blur-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-opacity-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-translate-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-stroke-width-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-stroke-color-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-stroke-opacity-transition': {duration: 100}}>().toExtend<
            CircleLayerSpecification['paint']
        >();
    });
    test('CircleLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'circle-translate-anchor-transition': {duration: 100}}>().not.toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-pitch-scale-transition': {duration: 100}}>().not.toExtend<
            CircleLayerSpecification['paint']
        >();
        expectTypeOf<{'circle-pitch-alignment-transition': {duration: 100}}>().not.toExtend<
            CircleLayerSpecification['paint']
        >();
    });

    test('ColorReliefLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'color-relief-opacity-transition': {duration: 100}}>().toExtend<
            ColorReliefLayerSpecification['paint']
        >();
    });
    test('ColorReliefLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'color-relief-color-transition': {duration: 100}}>().not.toExtend<
            ColorReliefLayerSpecification['paint']
        >();
    });

    test('FillLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'fill-opacity-transition': {duration: 100}}>().toExtend<
            FillLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-color-transition': {duration: 100}}>().toExtend<
            FillLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-outline-color-transition': {duration: 100}}>().toExtend<
            FillLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-translate-transition': {duration: 100}}>().toExtend<
            FillLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-pattern-transition': {duration: 100}}>().toExtend<
            FillLayerSpecification['paint']
        >();
    });
    test('FillLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'fill-antialias-transition': {duration: 100}}>().not.toExtend<
            FillLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-translate-anchor-transition': {duration: 100}}>().not.toExtend<
            FillLayerSpecification['paint']
        >();
    });

    test('FillExtrusionLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'fill-extrusion-opacity-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-extrusion-color-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-extrusion-translate-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-extrusion-pattern-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-extrusion-height-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
        expectTypeOf<{'fill-extrusion-base-transition': {duration: 100}}>().toExtend<
            FillExtrusionLayerSpecification['paint']
        >();
    });
    test('FillExtrusionLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{
            'fill-extrusion-translate-anchor-transition': {duration: 100};
        }>().not.toExtend<FillExtrusionLayerSpecification['paint']>();
        expectTypeOf<{
            'fill-extrusion-vertical-gradient-transition': {duration: 100};
        }>().not.toExtend<FillExtrusionLayerSpecification['paint']>();
    });

    test('HeatmapLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'heatmap-radius-transition': {duration: 100}}>().toExtend<
            HeatmapLayerSpecification['paint']
        >();
        expectTypeOf<{'heatmap-intensity-transition': {duration: 100}}>().toExtend<
            HeatmapLayerSpecification['paint']
        >();
        expectTypeOf<{'heatmap-opacity-transition': {duration: 100}}>().toExtend<
            HeatmapLayerSpecification['paint']
        >();
    });
    test('HeatmapLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'heatmap-weight-transition': {duration: 100}}>().not.toExtend<
            HeatmapLayerSpecification['paint']
        >();
        expectTypeOf<{'heatmap-color-transition': {duration: 100}}>().not.toExtend<
            HeatmapLayerSpecification['paint']
        >();
    });

    test('HillshadeLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'hillshade-exaggeration-transition': {duration: 100}}>().toExtend<
            HillshadeLayerSpecification['paint']
        >();
        expectTypeOf<{'hillshade-shadow-color-transition': {duration: 100}}>().toExtend<
            HillshadeLayerSpecification['paint']
        >();
        expectTypeOf<{'hillshade-highlight-color-transition': {duration: 100}}>().toExtend<
            HillshadeLayerSpecification['paint']
        >();
        expectTypeOf<{'hillshade-accent-color-transition': {duration: 100}}>().toExtend<
            HillshadeLayerSpecification['paint']
        >();
    });
    test('HillshadeLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{
            'hillshade-illumination-direction-transition': {duration: 100};
        }>().not.toExtend<HillshadeLayerSpecification['paint']>();
        expectTypeOf<{
            'hillshade-illumination-altitude-transition': {duration: 100};
        }>().not.toExtend<HillshadeLayerSpecification['paint']>();
        expectTypeOf<{
            'hillshade-illumination-anchor-transition': {duration: 100};
        }>().not.toExtend<HillshadeLayerSpecification['paint']>();
        expectTypeOf<{'hillshade-method-transition': {duration: 100}}>().not.toExtend<
            HillshadeLayerSpecification['paint']
        >();
    });

    test('LineLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'line-opacity-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-color-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-translate-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-width-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-gap-width-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-offset-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-blur-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-dasharray-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-pattern-transition': {duration: 100}}>().toExtend<
            LineLayerSpecification['paint']
        >();
    });
    test('LineLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'line-translate-anchor-transition': {duration: 100}}>().not.toExtend<
            LineLayerSpecification['paint']
        >();
        expectTypeOf<{'line-gradient-transition': {duration: 100}}>().not.toExtend<
            LineLayerSpecification['paint']
        >();
    });

    test('RasterLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'raster-opacity-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-hue-rotate-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-brightness-min-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-brightness-max-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-saturation-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-contrast-transition': {duration: 100}}>().toExtend<
            RasterLayerSpecification['paint']
        >();
    });
    test('RasterLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'raster-resampling-transition': {duration: 100}}>().not.toExtend<
            RasterLayerSpecification['paint']
        >();
        expectTypeOf<{'raster-fade-duration-transition': {duration: 100}}>().not.toExtend<
            RasterLayerSpecification['paint']
        >();
    });

    test('SymbolLayerSpecification contains *-transition keys for transitionable paint properties', () => {
        expectTypeOf<{'icon-opacity-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'icon-color-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'icon-halo-color-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'icon-halo-width-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'icon-halo-blur-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'icon-translate-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-opacity-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-color-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-halo-color-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-halo-width-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-halo-blur-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-translate-transition': {duration: 100}}>().toExtend<
            SymbolLayerSpecification['paint']
        >();
    });
    test('SymbolLayerSpecification does not contain *-transition keys for untransitionable paint properties', () => {
        expectTypeOf<{'icon-translate-anchor-transition': {duration: 100}}>().not.toExtend<
            SymbolLayerSpecification['paint']
        >();
        expectTypeOf<{'text-translate-anchor-transition': {duration: 100}}>().not.toExtend<
            SymbolLayerSpecification['paint']
        >();
    });
});

// Regression test for https://github.com/maplibre/maplibre-style-spec/issues/1626
import {test, expectTypeOf} from 'vitest';
import type {
    StyleSpecification,
    SourceSpecification,
    LightSpecification,
    SkySpecification,
    ProjectionSpecification,
    TerrainSpecification,
    TransitionSpecification,
    LayerSpecification,
    BackgroundLayerSpecification,
    CircleLayerSpecification,
    ColorReliefLayerSpecification,
    FillExtrusionLayerSpecification,
    FillLayerSpecification,
    HeatmapLayerSpecification,
    HillshadeLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
    GeoJSONSourceSpecification,
    ImageSourceSpecification,
    RasterDEMSourceSpecification,
    RasterSourceSpecification,
    VectorSourceSpecification,
    VideoSourceSpecification,
    ExpressionSpecification,
    ExpressionFilterSpecification,
    FilterSpecification,
    LegacyFilterSpecification,
    ColorSpecification,
    PaddingSpecification,
    NumberArraySpecification,
    ColorArraySpecification,
    FormattedSpecification,
    ResolvedImageSpecification,
    PromoteIdSpecification,
    SpriteSpecification,
    VariableAnchorOffsetCollectionSpecification
} from '../../dist';

test('public *Specification types are exported from dist/index.d.ts', () => {
    expectTypeOf<StyleSpecification>().toHaveProperty('layers');
    expectTypeOf<StyleSpecification>().toHaveProperty('sources');
    expectTypeOf<FillLayerSpecification>().toHaveProperty('type');
    expectTypeOf<LineLayerSpecification>().toHaveProperty('type');
    expectTypeOf<BackgroundLayerSpecification>().toHaveProperty('type');
    expectTypeOf<GeoJSONSourceSpecification>().toHaveProperty('type');
});

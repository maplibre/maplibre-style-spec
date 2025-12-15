# Terrain

The terrain configuration.

```json
"terrain": {"source": "raster-dem-source", "exaggeration": 0.5}
```
## source
*Required [string](types.md#string).*

The source for the terrain data.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|2.2.0|❌ ([#252](https://github.com/maplibre/maplibre-native/issues/252))|❌ ([#252](https://github.com/maplibre/maplibre-native/issues/252))|

## exaggeration
*Optional [number](types.md#number) in range [0, ∞). Defaults to `1`.*

The exaggeration of the terrain - how high it will look.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|2.2.0|❌ ([#252](https://github.com/maplibre/maplibre-native/issues/252))|❌ ([#252](https://github.com/maplibre/maplibre-native/issues/252))|


# TileJSON

A `vector`, `raster` or `raster-dem` [source](<https://maplibre.org/maplibre-style-spec/sources/index.md>) can point at a [TileJSON 3.0.0](<https://github.com/mapbox/tilejson-spec/tree/master/3.0.0>) document with its `url` property. MapLibre extends TileJSON with the keys below. A value set on the source in the style takes precedence over the same key in the TileJSON.

## encoding

### vector

*Optional [enum](<https://maplibre.org/maplibre-style-spec/types/index.md#enum>). Possible values: `mvt`, `mlt`. Defaults to `"mvt"`.*

The encoding used by this source. Mapbox Vector Tiles encoding is used by default.

- `mvt`: Mapbox Vector Tiles. See http://github.com/mapbox/vector-tile-spec for more info.
- `mlt`: MapLibre Vector Tiles. See https://github.com/maplibre/maplibre-tile-spec for more info.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| mvt | ✅ | ✅ | ✅ |
| mlt | 5.12.0 | 12.1.0 | 6.20.0 |

### raster-dem

*Optional [enum](<https://maplibre.org/maplibre-style-spec/types/index.md#enum>). Possible values: `terrarium`, `mapbox`, `custom`. Defaults to `"mapbox"`.*

The encoding used by this source. Mapbox Terrain RGB is used by default.

- `terrarium`: Terrarium format PNG tiles. See https://aws.amazon.com/es/public-datasets/terrain/ for more info.
- `mapbox`: Mapbox Terrain RGB tiles. See https://www.mapbox.com/help/access-elevation-data/\#mapbox-terrain-rgb for more info.
- `custom`: Decodes tiles using the redFactor, blueFactor, greenFactor, baseShift parameters.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| mapbox, terrarium | 0.43.0 | 6.0.0 | 6.0.0 |
| custom | 3.4.0 | ❌ ([\#2783](<https://github.com/maplibre/maplibre-native/issues/2783>)) | ❌ ([\#2783](<https://github.com/maplibre/maplibre-native/issues/2783>)) |

## sparse

### vector

*Optional [boolean](<https://maplibre.org/maplibre-style-spec/types/index.md#boolean>). Defaults to `false`.*

Experimental. Whether the tileset is sparse. When `true`, an empty tile response (HTTP 204, or no tile data from an archive such as PMTiles) means the tileset has no tile there at that zoom level, and a renderer may use a tile from a lower zoom level in its place. When `false`, an empty tile response means the tile is in the tileset and has nothing at that place.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | ❌ ([\#3990](<https://github.com/maplibre/maplibre-gl-js/issues/3990>)) | ❌ ([\#4767](<https://github.com/maplibre/maplibre-native/issues/4767>)) | ❌ ([\#4767](<https://github.com/maplibre/maplibre-native/issues/4767>)) |

## tileSize

### raster, raster-dem

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/index.md#number>). Units in pixels. Defaults to `512`.*

The minimum visual size to display tiles for this source.

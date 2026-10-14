# TileJSON

A `vector`, `raster` or `raster-dem` [source](sources.md) can point at a [TileJSON](https://github.com/mapbox/tilejson-spec/tree/master/3.0.0) document with its `url` property instead of listing its tiles in the style. MapLibre GL JS loads the document and reads the keys below from it, and a source property set in the style takes precedence over the same key in the TileJSON; `vector_layers` is read from the TileJSON only. MapLibre Native reads `tiles`, `minzoom`, `maxzoom`, `bounds`, `attribution` and `scheme` from the TileJSON, and a value set in the style takes precedence only for `minzoom` and `maxzoom` on a `vector` source.

| Key | Read from the TileJSON for |
| --- | --- |
| `tiles` | The tile URL templates. |
| `minzoom`, `maxzoom` | The zoom range the source has tiles for. |
| `bounds` | The area the source has tiles for; no tiles are requested outside it. |
| `attribution` | The attribution shown for the source. |
| `scheme` | The tile coordinate scheme, `xyz` or `tms`. |
| `vector_layers` | The ids of the layers in a vector source, which a layer's `source-layer` is checked against. |
| `tileSize` | The tile size in pixels of a `raster` or `raster-dem` source. |
| `encoding` | The encoding of the tiles<br><ul><li>`terrarium`, `mapbox` or `custom` for `raster-dem`,</li><li>`mvt` or `mlt` for `vector`</li></ul> |
| `emptyTileBehavior` | How a tile response with an empty body is handled, see below. |

The first six are part of TileJSON 3.0.0, while the last three are MapLibre's additions. TileJSON also defines `tilejson`, `name`, `description`, `version`, `center`, `data`, `fillzoom`, `grids`, `legend` and `template` that MapLibre does not read. TileJSON asks implementations to treat keys they do not know as absent, so a TileJSON that carries them is valid for other clients.

## emptyTileBehavior

A tile server with partial coverage can answer with an empty response (HTTP 204, or 200 with no content) where it has no tile. By default the empty response loads as an empty tile that draws nothing. Whether an empty tile means "nothing here" or "not generated at this zoom" is a property of the tileset, so our TileJSON allows for this differentiation. This is done for every style that uses this source:

```diff
{
  "tilejson": "3.0.0",
  "tiles": ["https://tiles.example.com/terrain/{z}/{x}/{y}.webp"],
  "minzoom": 0,
  "maxzoom": 12,
+ "emptyTileBehavior": "fallback"
}
```

These are possible `emptyTileBehavior` values:

- `render` (default): an empty response loads as an empty tile, with nothing to draw for `vector` and `raster` sources and no elevation for `raster-dem`.
- `fallback`: a loaded tile from another zoom level is used in place of the empty tile.

A style that sets the property on the source overrides the TileJSON:

```json
"terrain": {
  "type": "raster-dem",
  "url": "https://tiles.example.com/terrain.json",
  "emptyTileBehavior": "render"
}
```

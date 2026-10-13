# TileJSON

A `vector`, `raster` or `raster-dem` [source](sources.md) can point at a [TileJSON](https://github.com/mapbox/tilejson-spec/tree/master/3.0.0) document with its `url` property instead of listing its tiles in the style. MapLibre loads the document and reads the keys below from it. A source property set in the style takes precedence over the same key in the TileJSON; `vector_layers` is read from the TileJSON only.

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

The first six are part of TileJSON 3.0.0, which also defines `tilejson`, `name`, `description`, `version`, `center`, `data`, `fillzoom`, `grids`, `legend` and `template`; MapLibre does not read those. The last three are MapLibre's additions. TileJSON 3.0.0 asks implementations to treat keys they do not know as absent, so a TileJSON that carries them stays valid for other clients.

## emptyTileBehavior

A tile server with partial coverage has two ways to say that it has no tile at a place: a 404 response or an empty response (HTTP 204, or 200 with no content). For `raster` and `raster-dem` sources a 404 makes the tile missing, so a loaded tile from another zoom level shows through, and an empty response loads as an empty tile that draws nothing. `vector` sources load both as an empty tile. Whether an empty tile means "nothing here" or "not generated at this zoom" is a property of the tileset, so the TileJSON can say so once, for every style that uses it:

```json
{
  "tilejson": "3.0.0",
  "tiles": ["https://tiles.example.com/terrain/{z}/{x}/{y}.webp"],
  "minzoom": 0,
  "maxzoom": 12,
  "emptyTileBehavior": "fallback"
}
```

The values are those of the source property of the same name, documented for each source type in [sources](sources.md):

- `render` (default): an empty response loads as an empty tile, with nothing to draw for `vector` and `raster` sources and no elevation for `raster-dem`.
- `fallback`: an empty response is treated like a 404, and a loaded tile from another zoom level shows through. For `vector` sources a 404 response is treated the same way.

A style that sets the property on the source overrides the TileJSON:

```json
"terrain": {
  "type": "raster-dem",
  "url": "https://tiles.example.com/terrain.json",
  "emptyTileBehavior": "render"
}
```

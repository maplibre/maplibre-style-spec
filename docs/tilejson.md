# TileJSON

A `vector`, `raster` or `raster-dem` [source](sources.md) can point at a [TileJSON 3.0.0](https://github.com/mapbox/tilejson-spec/tree/master/3.0.0) document with its `url` property. MapLibre extends TileJSON with the keys below. A value set on the source in the style takes precedence over the same key in the TileJSON.

## `emptyTileBehavior`

OPTIONAL. String. Default: "render".

Either "render" or "fallback". Describes what an empty tile response (HTTP 204, or 200 with no content) means in this tileset. With "render", the empty tile is the data: the tileset has nothing at that place. With "fallback", the tileset has no tile there at that zoom level, and a renderer MAY use a tile from another zoom level in its place.

```json
{
  "emptyTileBehavior": "fallback"
}
```

## `encoding`

OPTIONAL. String. Default: "mvt" for a `vector` tileset, "mapbox" for a `raster-dem` tileset.

The encoding of the tiles. Either "mvt" or "mlt" for a `vector` tileset, and "terrarium", "mapbox" or "custom" for a `raster-dem` tileset.

```json
{
  "encoding": "terrarium"
}
```

## `tileSize`

OPTIONAL. Number. Default: 512.

The size of the tiles in pixels, for a `raster` or `raster-dem` tileset.

```json
{
  "tileSize": 256
}
```

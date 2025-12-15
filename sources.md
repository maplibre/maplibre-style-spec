# Sources

Sources state which data the map should display. Specify the type of source with the `type` property. Adding a source isn't enough to make data appear on the map because sources don't contain styling details like color or width. Layers refer to a source and give it a visual representation. This makes it possible to style the same source in different ways, like differentiating between types of roads in a highways layer.

Tiled sources (vector and raster) must specify their details according to the [TileJSON specification](https://github.com/mapbox/tilejson-spec).

```json
"sources": {
    "maplibre-demotiles": {
        "type": "vector",
        "url": "https://demotiles.maplibre.org/tiles/tiles.json"
    },
    "maplibre-tilejson": {
        "type": "vector",
        "url": "http://api.example.com/tilejson.json"
    },
    "maplibre-streets": {
        "type": "vector",
        "tiles": [
            "http://a.example.com/tiles/{z}/{x}/{y}.pbf",
            "http://b.example.com/tiles/{z}/{x}/{y}.pbf"
        ],
        "maxzoom": 14
    },
    "wms-imagery": {
        "type": "raster",
        "tiles": [
            "http://a.example.com/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=example"
        ],
        "tileSize": 256
    }
}
```
## vector

A vector tile source. Tiles must be in [Mapbox Vector Tile format](https://github.com/mapbox/vector-tile-spec). All geometric coordinates in vector tiles must be between `-1 * extent` and `(extent * 2) - 1` inclusive. All layers that use a vector source must specify a [`source-layer`](layers.md#source-layer) value. Note that features are only rendered within their originating tile, which may lead to visual artifacts when large values for width, radius, size or offset are specified. To mitigate rendering issues, either reduce the value of the property causing the artifact or, if you have control over the tile generation process, increase the buffer size to ensure that features are fully rendered within the tile.

```json
"sources": {
    "maplibre-streets": {
        "type": "vector",
        "tiles": [
            "http://a.example.com/tiles/{z}/{x}/{y}.pbf"
        ]
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.10.0|2.0.1|2.0.0|

### type
*Required [enum](types.md#enum). Possible values: `vector`.*

The type of the source.

* `vector`: A vector tile source.

### url
*Optional [string](types.md#string).*

A URL to a TileJSON resource. Supported protocols are `http:` and `https:`.


### tiles
*Optional [array](types.md#array).*

An array of one or more tile source URLs, as in the TileJSON spec.


### bounds
*Optional [array](types.md#array). Defaults to `[-180,-85.051129,180,85.051129]`.*

An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre.


### scheme
*Optional [enum](types.md#enum). Possible values: `xyz`, `tms`. Defaults to `"xyz"`.*

Influences the y direction of the tile coordinates. The global-mercator (aka Spherical Mercator) profile is assumed.

* `xyz`: Slippy map tilenames scheme.
* `tms`: OSGeo spec scheme.

### minzoom
*Optional [number](types.md#number). Defaults to `0`.*

Minimum zoom level for which tiles are available, as in the TileJSON spec.


### maxzoom
*Optional [number](types.md#number). Defaults to `22`.*

Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels.


### attribution
*Optional [string](types.md#string).*

Contains an attribution to be displayed when the map is shown to a user.


### promoteId
*Optional [promoteId](types.md).*

A property to use as a feature id (for feature state). Either a property name, or an object of the form `{<sourceLayer>: <propertyName>}`. If specified as a string for a vector tile source, the same property is used across all its source layers.


### volatile
*Optional [boolean](types.md#boolean). Defaults to `false`.*

A setting to determine whether a source's tiles are cached locally.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|Not planned|9.3.0|5.10.0|

### encoding
*Optional [enum](types.md#enum). Possible values: `mvt`, `mlt`. Defaults to `"mvt"`.*

The encoding used by this source. Mapbox Vector Tiles encoding is used by default.

* `mvt`: Mapbox Vector Tiles. See http://github.com/mapbox/vector-tile-spec for more info.
* `mlt`: MapLibre Vector Tiles. See https://github.com/maplibre/maplibre-tile-spec for more info.

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|mvt|✅|✅|✅|
|mlt|5.12.0|12.1.0|6.20.0|

## raster

A raster tile source.

```json
"sources": {
    "maplibre-satellite": {
        "type": "raster",
        "tiles": [
            "http://a.example.com/tiles/{z}/{x}/{y}.png"
        ],
        "tileSize": 256
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.10.0|2.0.1|2.0.0|

### type
*Required [enum](types.md#enum). Possible values: `raster`.*

The type of the source.

* `raster`: A raster tile source.

### url
*Optional [string](types.md#string).*

A URL to a TileJSON resource. Supported protocols are `http:` and `https:`.


### tiles
*Optional [array](types.md#array).*

An array of one or more tile source URLs, as in the TileJSON spec.


### bounds
*Optional [array](types.md#array). Defaults to `[-180,-85.051129,180,85.051129]`.*

An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre.


### minzoom
*Optional [number](types.md#number). Defaults to `0`.*

Minimum zoom level for which tiles are available, as in the TileJSON spec.


### maxzoom
*Optional [number](types.md#number). Defaults to `22`.*

Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels.


### tileSize
*Optional [number](types.md#number). Units in pixels. Defaults to `512`.*

The minimum visual size to display tiles for this layer. Only configurable for raster layers.


### scheme
*Optional [enum](types.md#enum). Possible values: `xyz`, `tms`. Defaults to `"xyz"`.*

Influences the y direction of the tile coordinates. The global-mercator (aka Spherical Mercator) profile is assumed.

* `xyz`: Slippy map tilenames scheme.
* `tms`: OSGeo spec scheme.

### attribution
*Optional [string](types.md#string).*

Contains an attribution to be displayed when the map is shown to a user.


### volatile
*Optional [boolean](types.md#boolean). Defaults to `false`.*

A setting to determine whether a source's tiles are cached locally.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|Not planned|9.3.0|5.10.0|

## raster-dem

A raster DEM source. Only supports [Mapbox Terrain RGB](https://blog.mapbox.com/global-elevation-data-6689f1d0ba65) and Mapzen Terrarium tiles.

```json
"sources": {
    "maplibre-terrain-rgb": {
        "type": "raster-dem",
        "encoding": "mapbox",
        "tiles": [
            "http://a.example.com/dem-tiles/{z}/{x}/{y}.png"
        ]
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.43.0|6.0.0|4.0.0|

### type
*Required [enum](types.md#enum). Possible values: `raster-dem`.*

The type of the source.

* `raster-dem`: A RGB-encoded raster DEM source

### url
*Optional [string](types.md#string).*

A URL to a TileJSON resource. Supported protocols are `http:` and `https:`.


### tiles
*Optional [array](types.md#array).*

An array of one or more tile source URLs, as in the TileJSON spec.


### bounds
*Optional [array](types.md#array). Defaults to `[-180,-85.051129,180,85.051129]`.*

An array containing the longitude and latitude of the southwest and northeast corners of the source's bounding box in the following order: `[sw.lng, sw.lat, ne.lng, ne.lat]`. When this property is included in a source, no tiles outside of the given bounds are requested by MapLibre.


### minzoom
*Optional [number](types.md#number). Defaults to `0`.*

Minimum zoom level for which tiles are available, as in the TileJSON spec.


### maxzoom
*Optional [number](types.md#number). Defaults to `22`.*

Maximum zoom level for which tiles are available, as in the TileJSON spec. Data from tiles at the maxzoom are used when displaying the map at higher zoom levels.


### tileSize
*Optional [number](types.md#number). Units in pixels. Defaults to `512`.*

The minimum visual size to display tiles for this layer. Only configurable for raster layers.


### attribution
*Optional [string](types.md#string).*

Contains an attribution to be displayed when the map is shown to a user.


### encoding
*Optional [enum](types.md#enum). Possible values: `terrarium`, `mapbox`, `custom`. Defaults to `"mapbox"`.*

The encoding used by this source. Mapbox Terrain RGB is used by default.

* `terrarium`: Terrarium format PNG tiles. See https://aws.amazon.com/es/public-datasets/terrain/ for more info.
* `mapbox`: Mapbox Terrain RGB tiles. See https://www.mapbox.com/help/access-elevation-data/#mapbox-terrain-rgb for more info.
* `custom`: Decodes tiles using the redFactor, blueFactor, greenFactor, baseShift parameters.

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|mapbox, terrarium|0.43.0|6.0.0|6.0.0|
|custom|3.4.0|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|

### redFactor
*Optional [number](types.md#number). Defaults to `1`.*

Value that will be multiplied by the red channel value when decoding. Only used on custom encodings.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|3.4.0|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|

### blueFactor
*Optional [number](types.md#number). Defaults to `1`.*

Value that will be multiplied by the blue channel value when decoding. Only used on custom encodings.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|3.4.0|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|

### greenFactor
*Optional [number](types.md#number). Defaults to `1`.*

Value that will be multiplied by the green channel value when decoding. Only used on custom encodings.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|3.4.0|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|❌ ([#2358](https://github.com/maplibre/maplibre-native/issues/2358))|

### baseShift
*Optional [number](types.md#number). Defaults to `0`.*

Value that will be added to the encoding mix when decoding. Only used on custom encodings.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|3.4.0|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|❌ ([#2783](https://github.com/maplibre/maplibre-native/issues/2783))|

### volatile
*Optional [boolean](types.md#boolean). Defaults to `false`.*

A setting to determine whether a source's tiles are cached locally.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|Not planned|9.3.0|5.10.0|

## geojson

A [GeoJSON](http://geojson.org/) source. Data must be provided via a `"data"` property, whose value can be a URL or inline GeoJSON. When using in a browser, the GeoJSON data must be on the same domain as the map or served with [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers.

```json
"sources": {
    "geojson-marker": {
        "type": "geojson",
        "data": {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [12.550343, 55.665957]
            },
            "properties": {
                "title": "Somewhere",
                "marker-symbol": "monument"
            }
        }
    },
    "geojson-lines": {
        "type": "geojson",
        "data": "./lines.geojson"
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.10.0|2.0.1|2.0.0|
|clustering|0.14.0|4.2.0|3.4.0|
|line distance metrics|0.45.0|6.5.0|4.4.0|

### type
*Required [enum](types.md#enum). Possible values: `geojson`.*

The data type of the GeoJSON source.

* `geojson`: A GeoJSON data source.

### data
*Required.*

A URL to a GeoJSON file, or inline GeoJSON.


### maxzoom
*Optional [number](types.md#number). Defaults to `18`.*

Maximum zoom level at which to create vector tiles (higher means greater detail at high zoom levels).


### attribution
*Optional [string](types.md#string).*

Contains an attribution to be displayed when the map is shown to a user.


### buffer
*Optional [number](types.md#number) in range [0, 512]. Defaults to `128`.*

Size of the tile buffer on each side. A value of 0 produces no buffer. A value of 512 produces a buffer as wide as the tile itself. Larger values produce fewer rendering artifacts near tile edges and slower performance.


### filter
*Optional [filter](expressions.md).*

An expression for filtering features prior to processing them for rendering.


### tolerance
*Optional [number](types.md#number). Defaults to `0.375`.*

Douglas-Peucker simplification tolerance (higher means simpler geometries and faster performance).


### cluster
*Optional [boolean](types.md#boolean). Defaults to `false`.*

If the data is a collection of point features, setting this to true clusters the points by radius into groups. Cluster groups become new `Point` features in the source with additional properties:

 * `cluster` Is `true` if the point is a cluster 

 * `cluster_id` A unique id for the cluster to be used in conjunction with the [cluster inspection methods](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/#getclusterexpansionzoom)

 * `point_count` Number of original points grouped into this cluster

 * `point_count_abbreviated` An abbreviated point count


### clusterRadius
*Optional [number](types.md#number) in range [0, ∞). Defaults to `50`.*

Radius of each cluster if clustering is enabled. A value of 512 indicates a radius equal to the width of a tile.


### clusterMaxZoom
*Optional [number](types.md#number).*

Max zoom on which to cluster points if clustering is enabled. Defaults to one zoom less than maxzoom (so that last zoom features are not clustered). Clusters are re-evaluated at integer zoom levels so setting clusterMaxZoom to 14 means the clusters will be displayed until z15.


### clusterMinPoints
*Optional [number](types.md#number).*

Minimum number of points necessary to form a cluster if clustering is enabled. Defaults to `2`.


### clusterProperties
*Optional.*

An object defining custom properties on the generated clusters if clustering is enabled, aggregating values from clustered points. Has the form `{"property_name": [operator, map_expression]}`. `operator` is any expression function that accepts at least 2 operands (e.g. `"+"` or `"max"`) — it accumulates the property value from clusters/points the cluster contains; `map_expression` produces the value of a single point.

Example: `{"sum": ["+", ["get", "scalerank"]]}`.

For more advanced use cases, in place of `operator`, you can use a custom reduce expression that references a special `["accumulated"]` value, e.g.:

`{"sum": [["+", ["accumulated"], ["get", "sum"]], ["get", "scalerank"]]}`


### lineMetrics
*Optional [boolean](types.md#boolean). Defaults to `false`.*

Whether to calculate line distance metrics. This is required for line layers that specify `line-gradient` values.


### generateId
*Optional [boolean](types.md#boolean). Defaults to `false`.*

Whether to generate ids for the geojson features. When enabled, the `feature.id` property will be auto assigned based on its index in the `features` array, over-writing any previous values.


### promoteId
*Optional [promoteId](types.md).*

A property to use as a feature id (for feature state). Either a property name, or an object of the form `{<sourceLayer>: <propertyName>}`.


## video

A video source. The `urls` value is an array. For each URL in the array, a video element [source](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source) will be created. To support the video across browsers, supply URLs in multiple formats.

The `coordinates` array contains `[longitude, latitude]` pairs for the video corners listed in clockwise order: top left, top right, bottom right, bottom left.

When rendered as a [raster layer](layers.md#raster), the layer's [`raster-fade-duration`](layers.md#raster-fade-duration) property will cause the video to fade in. This happens when playback is started, paused and resumed, or when the video's coordinates are updated. To avoid this behavior, set the layer's [`raster-fade-duration`](layers.md#raster-fade-duration) property to `0`.

```json
"sources": {
    "video": {
        "type": "video",
        "urls": [
            "https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4",
            "https://static-assets.mapbox.com/mapbox-gl-js/drone.webm"
        ],
        "coordinates": [
            [-122.51596391201019, 37.56238816766053],
            [-122.51467645168304, 37.56410183312965],
            [-122.51309394836426, 37.563391708549425],
            [-122.51423120498657, 37.56161849366671]
        ]
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.10.0|Not supported yet|Not supported yet|

### type
*Required [enum](types.md#enum). Possible values: `video`.*

The data type of the video source.

* `video`: A video data source.

### urls
*Required [array](types.md#array).*

URLs to video content in order of preferred format.


### coordinates
*Required [array](types.md#array).*

Corners of video specified in longitude, latitude pairs.


## image

An image source. The `url` value contains the image location. The `coordinates` array contains `[longitude, latitude]` pairs for the image corners listed in clockwise order: top left, top right, bottom right, bottom left.

```json
"sources": {
    "image": {
        "type": "image",
        "url": "https://maplibre.org/maplibre-gl-js/docs/assets/radar.gif",
        "coordinates": [
            [-80.425, 46.437],
            [-71.516, 46.437],
            [-71.516, 37.936],
            [-80.425, 37.936]
        ]
    }
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.10.0|5.2.0|3.7.0|

### type
*Required [enum](types.md#enum). Possible values: `image`.*

The data type of the image source.

* `image`: An image data source.

### url
*Required [string](types.md#string).*

URL that points to an image.


### coordinates
*Required [array](types.md#array).*

Corners of image specified in longitude, latitude pairs.



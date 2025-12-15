# Root

Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


```json

{
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {... },
    "layers": [...]
}

```


## version
*Required [enum](types.md#enum).*

Style specification version number. Must be 8.

```json
"version": 8
```

## name
*Optional [string](types.md#string).*

A human-readable name for the style.

```json
"name": "Bright"
```

## metadata
*Optional.*

Arbitrary properties useful to track with the stylesheet, but do not influence rendering. Properties should be prefixed to avoid collisions, like 'maplibre:'.

```json
"metadata": {
    "styleeditor:slimmode": true,
    "styleeditor:comment": "Style generated 1677776383",
    "styleeditor:version": "3.14.159265",
    "example:object": {
        "String": "one",
        "Number": 2,
        "Boolean": false
    }
}
```

## center
*Optional [array](types.md#array).*

Default map center in longitude and latitude.  The style center will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"center": [-73.9749, 40.7736]
```

## centerAltitude
*Optional [number](types.md#number).*

Default map center altitude in meters above sea level. The style center altitude defines the altitude where the camera is looking at and will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"centerAltitude": 123.4
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.0.0|❌ ([#2980](https://github.com/maplibre/maplibre-native/issues/2980))|❌ ([#2980](https://github.com/maplibre/maplibre-native/issues/2980))|

## zoom
*Optional [number](types.md#number).*

Default zoom level.  The style zoom will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"zoom": 12.5
```

## bearing
*Optional [number](types.md#number). Units in degrees. Defaults to `0`.*

Default bearing, in degrees. The bearing is the compass direction that is "up"; for example, a bearing of 90° orients the map so that east is up. This value will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"bearing": 29
```

## pitch
*Optional [number](types.md#number). Units in degrees. Defaults to `0`.*

Default pitch, in degrees. Zero is perpendicular to the surface, for a look straight down at the map, while a greater value like 60 looks ahead towards the horizon. The style pitch will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"pitch": 50
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|0-60 degrees|0.8.0|1.0.0|1.0.0|
|0-85 degrees|2.0.0|❌ ([#1909](https://github.com/maplibre/maplibre-native/issues/1909))|❌ ([#1909](https://github.com/maplibre/maplibre-native/issues/1909))|
|0-180 degrees|5.0.0|❌ ([#1909](https://github.com/maplibre/maplibre-native/issues/1909))|❌ ([#1909](https://github.com/maplibre/maplibre-native/issues/1909))|

## roll
*Optional [number](types.md#number). Units in degrees. Defaults to `0`.*

Default roll, in degrees. The roll angle is measured counterclockwise about the camera boresight. The style roll will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

```json
"roll": 45
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.0.0|❌ ([#2941](https://github.com/maplibre/maplibre-native/issues/2941))|❌ ([#2941](https://github.com/maplibre/maplibre-native/issues/2941))|

## state
*Optional [state](state.md). Defaults to `{}`.*

An object used to define default values when using the [`global-state`](https://maplibre.org/maplibre-style-spec/expressions/#global-state) expression.

```json
"state": {
    "chargerType": {"default": ["CCS", "CHAdeMO", "Type2"]},
    "minPreferredChargingSpeed": {"default": 50}
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.6.0|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|

## light
*Optional [light](light.md).*

The global light source.

```json
"light": {"anchor": "viewport", "color": "white", "intensity": 0.4}
```

## sky
*Optional [sky](sky.md).*

The map's sky configuration. **Note:** this definition is still experimental and is under development in maplibre-gl-js.

```json
"sky": {
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.5,
    "horizon-color": "#ffffff",
    "horizon-fog-blend": 0.5,
    "fog-color": "#0000ff",
    "fog-ground-blend": 0.5,
    "atmosphere-blend": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        10,
        1,
        12,
        0
    ]
}
```

## projection
*Optional [projection](projection.md).*

The projection configuration

```json
"projection": {
    "type": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        "vertical-perspective",
        12,
        "mercator"
    ]
}
```

## terrain
*Optional [terrain](terrain.md).*

The terrain configuration.

```json
"terrain": {"source": "raster-dem-source", "exaggeration": 0.5}
```

## sources
*Required [sources](sources.md).*

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

## sprite
*Optional [sprite](sprite.md).*

An array of `{id: 'my-sprite', url: 'https://example.com/sprite'}` objects. Each object should represent a unique URL to load a sprite from and and a unique ID to use as a prefix when referencing images from that sprite (i.e. 'my-sprite:image'). All the URLs are internally extended to load both .json and .png files. If the `id` field is equal to 'default', the prefix is omitted (just 'image' instead of 'default:image'). All the IDs and URLs must be unique. For backwards compatibility, instead of an array, one can also provide a single string that represent a URL to load the sprite from. The images in this case won't be prefixed.

```json
"sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite"
```

## glyphs
*Optional [string](types.md#string).*

A URL template for loading signed-distance-field glyph sets in PBF format.

If this property is set, any text in the `text-field` layout property is displayed in the font stack named by the `text-font` layout property based on glyphs located at the URL specified by this property. Otherwise, font faces will be determined by the `text-font` property based on the local environment.

The URL must include:

 - `{fontstack}` - When requesting glyphs, this token is replaced with a comma separated list of fonts from a font stack specified in the `text-font` property of a symbol layer. 

 - `{range}` - When requesting glyphs, this token is replaced with a range of 256 Unicode code points. For example, to load glyphs for the Unicode Basic Latin and Basic Latin-1 Supplement blocks, the range would be 0-255. The actual ranges that are loaded are determined at runtime based on what text needs to be displayed.

The URL must be absolute, containing the [scheme, authority and path components](https://en.wikipedia.org/wiki/URL#Syntax).

```json
"glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.0.16|0.1.1|0.1.0|
|omit to use local fonts|5.11.0|❌ ([#165](https://github.com/maplibre/maplibre-native/issues/165))|❌ ([#165](https://github.com/maplibre/maplibre-native/issues/165))|

## font-faces
*Optional [fontFaces](font-faces.md).*

The `font-faces` property can be used to specify what font files to use for rendering text. Font faces contain information needed to render complex texts such as [Devanagari](https://en.wikipedia.org/wiki/Devanagari), [Khmer](https://en.wikipedia.org/wiki/Khmer_script) among many others.<h2>Unicode range</h2>The optional `unicode-range` property can be used to only use a particular font file for characters within the specified unicode range(s). Its value should be an array of strings, each indicating a start and end of a unicode range, similar to the [CSS descriptor with the same name](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range). This allows specifying multiple non-consecutive unicode ranges. When not specified, the default value is `U+0-10FFFF`, meaning the font file will be used for all unicode characters.

Refer to the [Unicode Character Code Charts](https://www.unicode.org/charts/) to see ranges for scripts supported by Unicode. To see what unicode code-points are available in a font, use a tool like [FontDrop](https://fontdrop.info/).

<h2>Font Resolution</h2>For every name in a symbol layer’s [`text-font`](./layers.md/#text-font) array, characters are matched if they are covered one of the by the font files in the corresponding entry of the `font-faces` map. Any still-unmatched characters then fall back to the [`glyphs`](./glyphs.md) URL if provided.

<h2>Supported Fonts</h2>What type of fonts are supported is implementation-defined. Unsupported fonts are ignored.

```json
"font-faces": {
    "Noto Sans Regular": [
        {
            "url": "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansKhmer/hinted/ttf/NotoSansKhmer-Regular.ttf",
            "unicode-range": ["U+1780-17FF"]
        },
        {
            "url": "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf",
            "unicode-range": ["U+0900-097F"]
        },
        {
            "url": "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansMyanmar/hinted/ttf/NotoSansMyanmar-Regular.ttf",
            "unicode-range": ["U+1000-109F"]
        },
        {
            "url": "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansEthiopic/hinted/ttf/NotoSansEthiopic-Regular.ttf",
            "unicode-range": ["U+1200-137F"]
        }
    ],
    "Unifont": "https://ftp.gnu.org/gnu/unifont/unifont-15.0.01/unifont-15.0.01.ttf"
}
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|❌ ([#6637](https://github.com/maplibre/maplibre-gl-js/issues/6637))|11.13.0|6.18.0|

## transition
*Optional [transition](transition.md).*

A global transition definition to use as a default across properties, to be used for timing transitions between one value and the next when no property-specific transition is set. Collision-based symbol fading is controlled independently of the style's `transition` property.

```json
"transition": {"duration": 300, "delay": 0}
```

## layers
*Required [array](types.md#array).*

A style's `layers` property lists all the layers available in that style. The type of layer is specified by the `type` property, and must be one of `background`, `fill`, `line`, `symbol`, `raster`, `circle`, `fill-extrusion`, `heatmap`, `hillshade`, `color-relief`.

Except for layers of the `background` type, each layer needs to refer to a source. Layers take the data that they get from a source, optionally filter features, and then define how those features are styled.

```json
"layers": [
    {
        "id": "coastline",
        "source": "maplibre",
        "source-layer": "countries",
        "type": "line",
        "paint": {"line-color": "#198EC8"}
    }
]
```


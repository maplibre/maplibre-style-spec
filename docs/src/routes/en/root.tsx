import {SolidMd} from '~/utils/SolidMd';
export const title = 'Root';

function Root() {

    const md = `# Root
Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.

\`\`\`json
{
    "version": 8,
        "name": "Mapbox Streets",
            "sprite": "mapbox://sprites/mapbox/streets-v8",
                "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
                    "sources": {... },
    "layers": [...]
}
\`\`\`

## [bearing](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#bearing)

Optional [number](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#number). Units in degrees. Defaults to \`0\`.

Default bearing, in degrees. The bearing is the compass direction that is "up"; for example, a bearing of 90° orients the map so that east is up. This value will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

\`\`\`json
"bearing": 29
\`\`\`

## [center](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#center)

Optional [array](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#array) of [numbers](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#number).

Default map center in longitude and latitude. The style center will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

\`\`\`json
"center": [
    -73.9749,
    40.7736
]
\`\`\`

## [glyphs](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#glyphs)

Optional [string](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#string).

A URL template for loading signed-distance-field glyph sets in PBF format. The URL must include \`{ fontstack } \` and \`{ range } \` tokens. This property is required if any layer uses the \`text - field\` layout property. The URL must be absolute, containing the [scheme, authority and path components](https://en.wikipedia.org/wiki/URL#Syntax).

\`\`\`json
"glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
\`\`\`

## [layers](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#layers)

Required [array](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#array) of [layers](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/).

Layers will be drawn in the order of this array.

\`\`\`json
"layers": [
    {
        "id": "water",
        "source": "mapbox-streets",
        "source-layer": "water",
        "type": "fill",
        "paint": {
            "fill-color": "#00ffff"
        }
    }
]
\`\`\`

## [light](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#light)

Optional [light](https://maplibre.org/maplibre-gl-js-docs/style-spec/light/).

The global light source.

\`\`\`json
"light": {
    "anchor": "viewport",
    "color": "white",
    "intensity": 0.4
}
\`\`\`

## [metadata](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#metadata)

Optional.

Arbitrary properties useful to track with the stylesheet, but do not influence rendering. Properties should be prefixed to avoid collisions, like 'mapbox:'.

## [name](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#name)

Optional [string](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#string).

A human-readable name for the style.

\`\`\`json
"name": "Bright"
\`\`\`

## [pitch](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#pitch)

Optional [number](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#number). Units in degrees. Defaults to \`0\`.

Default pitch, in degrees. Zero is perpendicular to the surface, for a look straight down at the map, while a greater value like 60 looks ahead towards the horizon. The style pitch will be used only if the map has not been positioned by other means (e.g. map options or user interaction).

\`\`\`json
"pitch": 50
\`\`\`
    ## [sources](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#sources)

    Required object with [source](https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/) values.

    Data source specifications.

\`\`\`json
    "sources": {
        "maplibre-demotiles": {
            "type": "vector",
            "url": "https://demotiles.maplibre.org/tiles/tiles.json"
        }
    }
\`\`\`

## [sprite](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#sprite)

Optional [sprite](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#sprite)    

An array of \`{ id: 'my-sprite', url: 'https://example.com/sprite' } objects.Each object should represent a unique URL to load a sprite from and and a unique ID to use as a prefix when referencing images from that sprite(i.e. 'my-sprite:image').All the URLs are internally extended to load both.json and.png files.If the\`id\` field is equal to 'default', the prefix is omitted(just 'image' instead of 'default:image').All the IDs and URLs must be unique.For backwards compatibility, instead of an array, one can also provide a single string that represent a URL to load the sprite from.The images in this case won't be prefixed.

\`\`\`json
"sprite": "https://api.maptiler.com/maps/openstreetmap/sprite"
\`\`\`

## [terrain](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#terrain)

Optional [terrain](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#terrain)

The terrain configuration.

\`\`\`json
"terrain": {
    "source": "raster-dem-source",
    "exaggeration": 0.5
}
\`\`\`


## [transition](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#transition)

Optional [transition](https://maplibre.org/maplibre-gl-js-docs/style-spec/transition/)

A global transition definition to use as a default across properties, to be used for timing transitions between one value and the next when no property - specific transition is set.Collision - based symbol fading is controlled independently of the style's \`transition\` property.

\`\`\`json
"transition": {
    "duration": 300,
    "delay": 0
}
\`\`\`

## [version](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#version)

Required [enum](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#enum)

Style specification version number.Must be 8.

\`\`\`json
"version": 8
\`\`\`

## [zoom](https://maplibre.org/maplibre-gl-js-docs/style-spec/root/#zoom)

Optional [number](https://maplibre.org/maplibre-gl-js-docs/style-spec/types/#number)

Default zoom level.The style zoom will be used only if the map has not been positioned by other means(e.g.map options or user interaction).

\`\`\`json
    "zoom": 12.5
\`\`\``;

    return (
        <div>
            <SolidMd content={md} />
        </div>
    );
}

export default Root;

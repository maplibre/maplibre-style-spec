import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';

function Sprite() {

    const md = `
# Sprite

Loading a [sprite](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)) can be done using the optional \`sprite\` propety at the root level of a MapLibre style sheet.

The images contained in the sprite can be referenced in other style properties (\`background-pattern\`, \`fill-pattern\`, \`line-pattern\`,\`fill-extrusion-pattern\` and \`icon-image\`).

## Usage

You need to pass an URL where the sprite can be loaded from. 

\`\`\`json
"sprite": ${JSON.stringify(
        ref.$root.sprite.example,
        null,
        2
    )}
\`\`\`

This will load both an image by appending \`.png\` and the metadata about the sprite needed for loading by appending \`.json\`. See for yourself:

- [https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.png](https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.png)
- [https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.json](https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.json)

More details about the exact requirements on the format of these files is provided in the next section.

When a sprite is provided, you can refer to the images in the sprite in other parts of the style sheet. For example, when creating a symbol layer with the layout property \`"icon-image": "poi"\`. Or with the tokenized value  \`"icon-image": "{icon}"\` and vector tile features with an \`icon\` property with the value \`poi\`.

### Multiple Sprite Sources

**Note:** This is exclusive to MapLibre GL JS at the moment. See [this issue](https://github.com/maplibre/maplibre-native/issues/641) for the current status of this feature in MapLibre Native.

You can also supply an array of \`{ id: ..., url: ... }\` pairs to load multiple sprites:

\`\`\`json
"sprite": [
  {
    id: 'roadsigns',
    url: 'https://example.com/myroadsigns'
  },
  {
    id: 'shops',
    url: 'https://example2.com/someurl'
  },
  {
    id: 'default',
    url: 'https://example2.com/anotherurl'
  }
]
\`\`\`

As you can see, each sprite has an id. All images contained within a sprite also have an id. When using multiple sprites, you need to prefix the id of the image with the id of the sprite it is contained within, followed by a colon. For example, to reference the \`stop_sign\` image on the \`roadsigns\` sprite, you would need to use \`roadsigns:stop_sign\`.

The sprite with id \`default\` is special in that you do not need to prefix the images contained within it. For example, to reference the image with id \`airport\` in the default sprite above, you can simply use \`airport\`.

## Sprite Source Format

A valid sprite source must supply two types of files:

- _An image file_, which is a PNG image containing the sprite data.

- An _index file_, which is a JSON document containing a description of each image contained in the sprite. The content of this file must be a JSON object whose keys form identifiers to be used as the values of the above style properties, and whose values are objects describing the dimensions (\`width\` and \`height\` properties) and pixel ratio (\`pixelRatio\`) of the image and its location within the sprite (\`x\` and \`y\`). For example, a sprite containing a single image might have the following index file contents:

  \`\`\`json
  {
      "poi": {
          "width": 32,
          "height": 32,
          "x": 0,
          "y": 0,
          "pixelRatio": 1
      }
  }
  \`\`\`

### Optional Properties

Apart from these required properties, the following optional properties are supported:

- \`content\`: An array of four numbers, with the first two specifying the left, top corner, and the last two specifying the right, bottom corner. If present, and if the icon uses [\`icon-text-fit\`](${import.meta.env.BASE_URL}layers/#layout-symbol-icon-text-fit), the symbol's text will be fit inside the content box.
- \`stretchX\`: An array of two-element arrays, consisting of two numbers that represent the _from_ position and the _to_ position of areas that can be stretched.
- \`stretchY\`: Same as \`stretchX\`, but for the vertical dimension.
- \`sdf\`: Boolean. If \`true\` then the image is handled as a signed-distance field (SDF) and its color can be set at runtime using the [\`icon-color\`](${import.meta.env.BASE_URL}layers/#paint-symbol-icon-color) and [\`icon-halo-color\`](${import.meta.env.BASE_URL}layers/#paint-symbol-icon-halo-color) properties. Defaults to \`false\`.

#### Stretch Properties

The following image gives a bit more infomation regarding the stretch properties:

\`\`\`json
{
    "sheild": {
        "width": 25,
        "height": 30,
        "x": 0,
        "y": 0,
        "stretchX": [[5, 10], [15, 20]]
        "stretchY": [[5, 20]]
        "pixelRatio": 1
    }
}
\`\`\`
The red highlighted part is where the stretch will occur over the Y axis and the blue highlight is for the X axis.
![popup-stretch](https://maplibre.org/maplibre-gl-js/docs/assets/popup_debug.png)

## High-DPI Devices

On high-DPI devices, \`@2x\` is appended to  the URLs described above. For example, if you specified \`"sprite": "https://example.com/sprite"\`, renderers would load \`https://example.com/sprite.json\` and \`https://example.com/sprite.png\`, or \`https://example.com/sprite@2x.json\` and \`https://example.com/sprite@2x.png\`.

## Generating Sprites

A tool that can generate sprites from svg files can be found in here: [@elastic/spritezero](https://www.npmjs.com/package/@elastic/spritezero)

`;

    return (
        <div>
            <Markdown content={md} />
        </div>
    );
}

export default Sprite;

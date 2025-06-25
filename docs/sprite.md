# Sprite

Loading a [sprite](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)) can be done using the optional `sprite` property at the root level of a MapLibre style sheet.

The images contained in the sprite can be referenced in other style properties (`background-pattern`, `fill-pattern`, `line-pattern`,`fill-extrusion-pattern` and `icon-image`).

## Usage

You need to pass an URL where the sprite can be loaded from. 

```json
"sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite"
```

This will load both an image by appending `.png` and the metadata about the sprite needed for loading by appending `.json`. See for yourself:

- [https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.png](https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.png)
- [https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.json](https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite.json)

More details about the exact requirements on the format of these files is provided in the next section.

When a sprite is provided, you can refer to the images in the sprite in other parts of the style sheet. For example, when creating a symbol layer with the layout property `"icon-image": "poi"`. Or with the tokenized value  `"icon-image": "{icon}"` and vector tile features with an `icon` property with the value `poi`.

### Multiple Sprite Sources

You can also supply an array of `{ id: ..., url: ... }` pairs to load multiple sprites:

```json
"sprite": [
    {
        "id": "roadsigns",
        "url": "https://example.com/myroadsigns"
    },
    {
        "id": "shops",
        "url": "https://example2.com/someurl"
    },
    {
        "id": "default",
        "url": "https://example2.com/anotherurl"
    }
]
```

As you can see, each sprite has an id. All images contained within a sprite also have an id. When using multiple sprites, you need to prefix the id of the image with the id of the sprite it is contained within, followed by a colon. For example, to reference the `stop_sign` image on the `roadsigns` sprite, you would need to use `roadsigns:stop_sign`.

The sprite with id `default` is special in that you do not need to prefix the images contained within it. For example, to reference the image with id `airport` in the default sprite above, you can simply use `airport`.

## Sprite Source Format

A valid sprite source must supply two types of files:

- _An image file_, which is a PNG image containing the sprite data.

- An _index file_, which is a JSON document containing a description of each image contained in the sprite. The content of this file must be a JSON object whose keys form identifiers to be used as the values of the above style properties, and whose values are objects describing the dimensions (`width` and `height` properties) and pixel ratio (`pixelRatio`) of the image and its location within the sprite (`x` and `y`). For example, a sprite containing a single image might have the following index file contents:

  ```json
  {
      "poi": {
          "width": 32,
          "height": 32,
          "x": 0,
          "y": 0,
          "pixelRatio": 1
      }
  }
  ```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS|
|-----------|--------------|-----------|-------|
|basic functionality| ✅ | ✅ | ✅ |
|`textFitWidth`, `textFitHeight`| 4.2.0 | 11.4.0 | 6.6.0 |

### Optional Properties

Apart from these required properties, the following optional properties are supported:

- `content`: An array of four numbers, with the first two specifying the left, top corner, and the last two specifying the right, bottom corner. If present, and if the icon uses [`icon-text-fit`](layers.md#icon-text-fit), the symbol's text will be fit inside the content box.
- `stretchX`: An array of two-element arrays, consisting of two numbers that represent the _from_ position and the _to_ position of areas that can be stretched.
- `stretchY`: Same as `stretchX`, but for the vertical dimension.
- `sdf`: Boolean. If `true` then the image is handled as a signed-distance field (SDF) and its color can be set at runtime using the [`icon-color`](layers.md#icon-color) and [`icon-halo-color`](layers.md#icon-halo-color) properties. Defaults to `false`.
- `textFitWidth`: TextFit enum of the value stretchOrShrink (or undefined), stretchOnly, proportional describing the behavior, horizontally, when scaling a sprite due to 'icon-text-fit': 'both'.
- `textFitHeight`: Same as `textFitWidth` except vertically.

#### Stretch Properties

The following image gives a bit more infomation regarding the stretch properties:

```json
{
    "shield": {
        "width": 25,
        "height": 30,
        "x": 0,
        "y": 0,
        "stretchX": [[5, 10], [15, 20]]
        "stretchY": [[5, 20]]
        "pixelRatio": 1
    }
}
```
The red highlighted part is where the stretch will occur over the Y axis and the blue highlight is for the X axis.
![popup-stretch](https://maplibre.org/maplibre-gl-js/docs/assets/popup_debug.png)

#### Text Fit Properties

The properties `textFitWidth` and `textFitHeight` alter how a sprite's content rectangle maps to its contents when scaling a sprite.  These properties are defined with the enum TextFit which may have the following values:
* `stretchOrShrink` (or omitted)
* `stretchOnly` 
* `proportional`

The primary use cases of interest are:
1. Both properties are undefined or stretchOrShrink
   
   The content rectangle scales precisely to contain its contents.
   
2. textFitWidth = stretchOnly and textFitHeight = proportional

   The content rectangle scales to precisely contain the height of its contents but the width will not shrink smaller than the aspect ratio of the original content rectangle. This is primarily useful for shields that shouldn't become too narrow if their contents are narrow (like the number "1").
   
3. textFitWidth = proportional and textFitHeight = stretchOnly

   The content rectangle scales to precisely contain the width of its contents but the height will not shrink smaller than the aspect ratio of the original content rectangle. This may be useful scenarios like no. 2 except with vertically written scripts (using `"text-writing-mode": ["vertical"]`).

![image](https://github.com/DavidBuerer/maplibre-style-spec/assets/29717748/5fc7134e-28dc-4c3c-b89e-d89b50b8dbfa)

## High-DPI Devices

On high-DPI devices, `@2x` is appended to  the URLs described above. For example, if you specified `"sprite": "https://example.com/sprite"`, renderers would load `https://example.com/sprite.json` and `https://example.com/sprite.png`, or `https://example.com/sprite@2x.json` and `https://example.com/sprite@2x.png`.

## Generating Sprites

There are tools that can generate sprites from SVG files, such as [spreet](https://github.com/flother/spreet) and [spritezero](https://www.npmjs.com/package/@elastic/spritezero).

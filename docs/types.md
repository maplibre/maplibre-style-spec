# Types

MapLibre style contains values of various types, most commonly as values for the style properties of a layer.

## Color

The `color` type is a color in the [sRGB color space](https://en.wikipedia.org/wiki/SRGB). Colors are JSON strings in a variety of permitted formats: HTML-style hex values, RGB, RGBA, HSL, and HSLA. Predefined HTML colors names, like `yellow` and `blue`, are also permitted.

```json
{
    "line-color": "#ff0",
    "line-color": "#ffff00",
    "line-color": "rgb(255, 255, 0)",
    "line-color": "rgba(255, 255, 0, 1)",
    "line-color": "hsl(100, 50%, 50%)",
    "line-color": "hsla(100, 50%, 50%, 1)",
    "line-color": "yellow"
}
```

## Formatted

The `formatted` type is a string broken into sections annotated with separate formatting options.

```json
{
    "text-field": ["format",
        "foo", { "font-scale": 1.2 },
        "bar", { "font-scale": 0.8 }
    ]
}
```


## ResolvedImage

The `resolvedImage` type is an image (e.g., an icon or pattern) which is used in a layer. An input to the `image` expression operator is checked against the current map style to see if it is available to be rendered or not, and the result is returned in the `resolvedImage` type. This approach allows developers to define a series of images which the map can fall back to if previous images are not found, which cannot be achieved by providing, for example, `icon-image` with a plain string (because multiple strings cannot be supplied to `icon-image` and multiple images cannot be defined in a string).

```json
{
    "icon-image": ["coalesce", ["image", "myImage"], ["image", "fallbackImage"]]
}
```


## String

A string is text. In MapLibre styles, strings are in quotes.

```json
{
    "source": "mySource"
}
```


## Boolean

Boolean means yes or no, so it accepts the values `true` or `false`.

```json
{
    "fill-enabled": true
}
```


## Number

A number value, often an integer or floating point (decimal number). Written without quotes.

```json
{
    "text-size": 24
}
```


## Array

Arrays are comma-separated lists of one or more values in a specific order. For example, they're used in line dash arrays, in which the numbers specify intervals of line, break, and line again. If an array is used as an argument in an expression, the array must be wrapped in a `literal` expression.

```json
{
    "line-dasharray": [2, 4]
}

{
    "circle-color": ["in", 1, ["literal", [1, 2, 3]]]
}
```

## Point

Points are two-element numeric arrays representing `[x, y]` coordinate pairs. Units and other interpretations of the x/y values depend on where and how the point type is used.

```json
{
    "line-translate": [2, 4]
}
```

## Enum

Enums are a closed set of possible string values. Failing to provide a value within the closed set will result in an error.

```json
{
    "circle-translate-anchor": "viewport"
}
```

## Padding

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS|
|-----------|--------------|-----------|-------|
|Single number| 0.10.0 | 2.0.1 | 2.0.0 |
|Array of numbers| 2.2.0 | 11.5.0 | 6.7.0 |

An array of numbers with syntax similar to [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/padding):

- A single value applies to all four sides, e.g. `[2]`;
- two values apply to [top/bottom, left/right], e.g. `[2, 3]`;
- three values apply to [top, left/right, bottom] e.g. `[2, 3, 1]`;
- four values apply to [top, right, bottom, left], e.g. `[2, 3, 1, 0]`.

A single number is accepted for backwards-compatibility, and treated the same as a one-element array — padding applied to all sides.

The following example applies 2em padding on top and bottom and 3em padding left and right.

```json
{
    "icon-padding": [2, 3]
}
```

## ProjectionDefinition

The `projection` is used to configure which projection to use for the map.

There are currently two projections implemented.

- `mercator` - [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection)
- `vertical-perspective` - [Vertical Perspective projection](https://en.wikipedia.org/wiki/General_Perspective_projection)

And the following [presets](#use-a-projection-preset)

The `projection` output sent to the renderer is always of the shape:

`[from, to, transition]: [string, string, number]`

- `from` is the projection of lower zoom level
- `to` is the projection of higher zoom level
- `transition` is the interpolation value, going from 0 to 1, with 0 being in the `from` projection, and 1 being in the `to` projection.

In case `from` and `to` are equal, the `transition` will have no effect.

### Examples

#### Step between projection at discrete zoom levels

Use a [`camera expression`](./expressions.md#camera-expressions), to discretely [`step`](./expressions.md#step) between projections at certain zoom levels.


```ts
type: ["step", ["zoom"],
    "vertical-perspective",
    11, "mercator"
]


output at zoom 10.9: "vertical-perspective"
output at zoom 11.0: "vertical-perspective"
output at zoom 11.1: "mercator"
```

#### Animate between different projections based on zoom level**

Use a [`camera expression`](./expressions.md#camera-expressions), to animate between projections based on zoom, using [`interpolate`](./expressions.md#interpolate) function. The example below will yield an adaptive globe that interpolates from `vertical-perspective` to `mercator` between zoom 10 and 12.

```ts
type: ["interpolate", ["linear"], ["zoom"],
    10,"vertical-perspective",
    12,"mercator"
]


output at zoom 9.9:  "vertical-perspective"
output at zoom 11:   ["vertical-perspective", "mercator", 0.5]
output at zoom 12:   ["vertical-perspective", "mercator", 1]
output at zoom 12.1: "mercator"
```


#### Provide a `projection` 

```ts
type: ["vertical-perspective", "mercator", 0.7]
```

#### Use a projection preset

There are also additional presets that yield commonly used expressions:


| Preset | Full value | Description |
|--------|------------|-------------|
| `globe` | `["interpolate", ["linear"], ["zoom"],`<br>`10, "vertical-perspective", 12, "mercator"]` | Adaptive globe: interpolates from vertical-perspective to mercator projection between zoom levels 10 and 12. |


## `numberArray`

A single number value, or an array of number values.

```json
{
    "hillshade-illumination-direction": 24,
    "hillshade-illumination-direction": [45, 57.3]
}
```

## `colorArray`

A single color value, or an array of color values.

```json
{
    "hillshade-highlight-color": "#ffff00",
    "hillshade-highlight-color": ["#ffff00", "rgb(255, 255, 0)", "yellow"]
}
```
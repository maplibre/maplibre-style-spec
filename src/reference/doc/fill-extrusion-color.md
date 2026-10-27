#### Shading and opacity

The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use [`fill-extrusion-opacity`](#fill-extrusion-opacity) to set layer opacity.

#### Using the `elevation` expression

The color can vary along the height of the extrusion by using `elevation`, the height above the ground in meters, as input. For example, this darkens the bottom 10 meters of every wall:

```json
"fill-extrusion-color": [
    "interpolate",
    ["linear"],
    ["elevation"],
    0,
    "#5a5a5a",
    10,
    "#a0a0a0"
]
```

Roofs take the color at their height. `elevation` is measured from the ground, not from sea level, even when terrain is enabled.

!!! tip
    When the `elevation` expression is used, consider disabling [`fill-extrusion-vertical-gradient`](#fill-extrusion-vertical-gradient), which darkens the walls on top of this color.

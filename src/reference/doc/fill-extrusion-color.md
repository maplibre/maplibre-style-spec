#### Shading and opacity

The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use [`fill-extrusion-opacity`](#fill-extrusion-opacity) to set layer opacity.

#### Using the `elevation` expression

The color can vary along the height of the extrusion by using `elevation`, the height above the ground in meters, as input. For example, this draws a dark band on every fourth meter of the walls, suggesting floors:

<div class="grid" markdown>

```json
"fill-extrusion-color": [
    "step",
    ["%", ["elevation"], 4],
    "#d8d8d8",
    3,
    "#505050"
]
```

![Extrusions with a dark band every 4 meters of elevation](assets/fill-extrusion-elevation-step.png)

</div>

`elevation` can also be combined with feature properties. Here every extrusion fades from a dark base to its own `color` property at 40 meters:

<div class="grid" markdown>

```json
"fill-extrusion-color": [
    "interpolate",
    ["linear"],
    ["elevation"],
    0,
    "#101010",
    40,
    ["to-color", ["get", "color"]]
]
```

![Extrusions fading from dark at the ground to each feature's own color](assets/fill-extrusion-elevation-property-function.png)

</div>

Roofs take the color at their height. `elevation` is measured from the ground, not from sea level, even when terrain is enabled.

!!! tip
    When the `elevation` expression is used, consider disabling [`fill-extrusion-vertical-gradient`](#fill-extrusion-vertical-gradient), which darkens the walls on top of this color.

# Sky

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
## sky-color
*Optional [color](types.md#color). Defaults to `"#88C6FC"`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

The base color for the sky.


## horizon-color
*Optional [color](types.md#color). Defaults to `"#ffffff"`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

The base color at the horizon.


## fog-color
*Optional [color](types.md#color). Defaults to `"#ffffff"`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

The base color for the fog. Requires 3D terrain.


## fog-ground-blend
*Optional [number](types.md#number) in range [0, 1]. Defaults to `0.5`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

How to blend the fog over the 3D terrain. Where 0 is the map center and 1 is the horizon.


## horizon-fog-blend
*Optional [number](types.md#number) in range [0, 1]. Defaults to `0.8`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

How to blend the fog color and the horizon color. Where 0 is using the horizon color only and 1 is using the fog color only.


## sky-horizon-blend
*Optional [number](types.md#number) in range [0, 1]. Defaults to `0.8`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

How to blend the sky color and the horizon color. Where 1 is blending the color at the middle of the sky and 0 is not blending at all and using the sky color only.


## atmosphere-blend
*Optional [number](types.md#number) in range [0, 1]. Defaults to `0.8`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

How to blend the atmosphere. Where 1 is visible atmosphere and 0 is hidden. It is best to interpolate this expression when using globe projection.



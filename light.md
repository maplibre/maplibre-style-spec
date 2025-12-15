# Light

The global light source.

```json
"light": {"anchor": "viewport", "color": "white", "intensity": 0.4}
```
## anchor
*Optional [enum](types.md#enum). Possible values: `map`, `viewport`. Defaults to `"viewport"`.*

Whether extruded geometries are lit relative to the map or viewport.

* `map`: The position of the light source is aligned to the rotation of the map.
* `viewport`: The position of the light source is aligned to the rotation of the viewport.
```json
"anchor": "map"
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.27.0|5.1.0|3.6.0|

## position
*Optional [array](types.md#array). Defaults to `[1.15,210,30]`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

Position of the light source relative to lit (extruded) geometries, in [r radial coordinate, a azimuthal angle, p polar angle] where r indicates the distance from the center of the base of an object to its light, a indicates the position of the light relative to 0° (0° when `light.anchor` is set to `viewport` corresponds to the top of the viewport, or 0° when `light.anchor` is set to `map` corresponds to due north, and degrees proceed clockwise), and p indicates the height of the light (from 0°, directly above, to 180°, directly below).

```json
"position": [1.5, 90, 80]
```

|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.27.0|5.1.0|3.6.0|

## color
*Optional [color](types.md#color). Defaults to `"#ffffff"`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

Color tint for lighting extruded geometries.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.27.0|5.1.0|3.6.0|

## intensity
*Optional [number](types.md#number) in range [0, 1]. Defaults to `0.5`. Supports [interpolate](expressions.md#interpolate) expressions. Transitionable.*

Intensity of lighting (on a scale from 0 to 1). Higher numbers will present as more extreme contrast.


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.27.0|5.1.0|3.6.0|


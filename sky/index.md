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

*Optional [color](<https://maplibre.org/maplibre-style-spec/types/#color>). Defaults to `"#88C6FC"`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

The base color for the sky.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## horizon-color

*Optional [color](<https://maplibre.org/maplibre-style-spec/types/#color>). Defaults to `"#ffffff"`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

The base color at the horizon.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## fog-color

*Optional [color](<https://maplibre.org/maplibre-style-spec/types/#color>). Defaults to `"#ffffff"`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

The base color for the fog. Requires 3D terrain.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## fog-ground-blend

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, 1]`. Defaults to `0.5`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

How to blend the fog over the 3D terrain. Where 0 is the map center and 1 is the horizon.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## horizon-fog-blend

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, 1]`. Defaults to `0.8`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

How to blend the fog color and the horizon color. Where 0 is using the horizon color only and 1 is using the fog color only.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## sky-horizon-blend

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, 1]`. Defaults to `0.8`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

How to blend the sky color and the horizon color. Where 1 is blending the color at the middle of the sky and 0 is not blending at all and using the sky color only.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

## atmosphere-blend

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, 1]`. Defaults to `0.8`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions. [Transitionable](<https://maplibre.org/maplibre-style-spec/transition/index.md>).*

How to blend the atmosphere. Where 1 is visible atmosphere and 0 is hidden. It is best to interpolate this expression when using globe projection.

| SDK Support | MapLibre GL JS | MapLibre Native<br>Android | MapLibre Native<br>iOS |
| --- | --- | --- | --- |
| basic functionality | 4.5.0 | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) | ❌ ([\#4414](<https://github.com/maplibre/maplibre-native/issues/4414>)) |
| [`global-state`](<https://maplibre.org/maplibre-style-spec/expressions/#global-state>) expression | 6.1.0 | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) | ❌ ([\#3302](<https://github.com/maplibre/maplibre-native/issues/3302>)) |

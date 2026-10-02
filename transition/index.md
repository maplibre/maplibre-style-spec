# Transition

A global transition definition to use as a default across properties, to be used for timing transitions between one value and the next when no property-specific transition is set. Collision-based symbol fading is controlled independently of the style's `transition` property.

In addition to this global definition via `transition`, if any individual paint or layout property are marked as `Transitionable`, a corresponding `*-transition` property is avaliable to fine-tune the property’s animation between old and new values based on similar `duration` and `delay` values.

For example, [`fill-color`](<https://maplibre.org/maplibre-style-spec/layers/#fill-color>) is marked as `Transitionable`, so it can transition either independently via `fill-color-transition` or globally via the style's `transition` property:

```json
"transition": {"duration": 300, "delay": 0}
```

## duration

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, ∞)`. Units in milliseconds. Defaults to `300`.*

Time allotted for transitions to complete.

## delay

*Optional [number](<https://maplibre.org/maplibre-style-spec/types/#number>) in range `[0, ∞)`. Units in milliseconds. Defaults to `0`.*

Length of time before a transition begins.

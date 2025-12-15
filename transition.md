# Transition

A global transition definition to use as a default across properties, to be used for timing transitions between one value and the next when no property-specific transition is set. Collision-based symbol fading is controlled independently of the style's `transition` property.

```json
"transition": {"duration": 300, "delay": 0}
```
## duration
*Optional [number](types.md#number) in range [0, ∞). Units in milliseconds. Defaults to `300`.*

Time allotted for transitions to complete.


## delay
*Optional [number](types.md#number) in range [0, ∞). Units in milliseconds. Defaults to `0`.*

Length of time before a transition begins.



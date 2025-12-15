# Projection

The projection configuration

```json
"projection": {
    "type": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        "vertical-perspective",
        12,
        "mercator"
    ]
}
```
## type
*Optional [projectionDefinition](types.md#projectiondefinition). Defaults to `"mercator"`. Supports [interpolate](expressions.md#interpolate) expressions.*

The projection definition type. Can be specified as a string, a transition state, or an expression.



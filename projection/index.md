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

*Optional [projectionDefinition](<https://maplibre.org/maplibre-style-spec/types/#projectiondefinition>). Defaults to `"mercator"`. Supports [interpolate](<https://maplibre.org/maplibre-style-spec/expressions/#interpolate>) expressions.*

The projection definition type. Can be specified as a string, a transition state, or an expression.

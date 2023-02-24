---
title: Root
id: root
description: Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.
contentType: specification
order: 2
layout: page
hideFeedback: true
products:
- MapLibre Style Specification
prependJs:
    - "import Items from '../../components/style-spec/items';"
    - "import ref from '../../../../tsc/src/reference/latest';"
---

Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.

```json
{
    "version": {{ref.$version}},
    "name": "Mapbox Streets",
    "sprite": "mapbox://sprites/mapbox/streets-v{{ref.$version}}",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    "sources": {...},
    "layers": [...]
}
```

<!--
START GENERATED CONTENT:
Content in this section is generated directly using the MapLibre Style
Specification. To update any content displayed in this section, make edits to:
https://github.com/maplibre/maplibre-gl-style-spec/blob/main/src/reference/v8.json.
-->
{{<Items headingLevel='2' entry={ref.$root} />}}
<!-- END GENERATED CONTENT -->

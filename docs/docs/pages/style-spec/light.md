---
title: Light
id: light
description: A style's light property provides global light source for that style.
contentType: specification
order: 3
layout: page
hideFeedback: true
products:
- MapLibre Style Specification
prependJs:
    - "import Items from '../../components/style-spec/items';"
    - "import ref from '../../../maplibre-gl-js/rollup/build/tsc/src/style-spec/reference/latest';"
---

A style's `light` property provides a global light source for that style. Since this property is the light used to light extruded features, you will only see visible changes to your map style when modifying this property if you are using extrusions.

```json
"light": {{JSON.stringify(
    ref.$root.light.example,
    null,
    2
)}}
```

<!--
START GENERATED CONTENT:
Content in this section is generated directly using the MapLibre Style
Specification. To update any content displayed in this section, make edits to:
https://github.com/maplibre/maplibre-gl-js/blob/main/src/style-spec/reference/v8.json.
-->
{{ <Items headingLevel='2' entry={ref.light} /> }}
<!-- END GENERATED CONTENT -->

---
title: Transition
id: transition
description: A transition property controls timing for the interpolation between a transitionable style property's previous value and new value.
contentType: specification
order: 7
layout: page
hideFeedback: true
products:
- MapLibre Style Specification
prependJs:
    - "import Items from '../../components/style-spec/items';"
    - "import ref from '../../../../tsc/src/reference/latest';"
    - "import Icon from '@mapbox/mr-ui/icon';"
---

A `transition` property controls timing for the interpolation between a transitionable style property's previous value and new value. A style's <a href="#root-transition" title="link to root-transition">root `transition`</a> property provides global transition defaults for that style.

```json
"transition": {{JSON.stringify(
    ref.$root.transition.example,
    null,
    2
)}}
```
Any transitionable layer property, marked by {{<Icon
        name="opacity"
        inline={true}
    />}}, may also have its own `*-transition` property that defines specific transition timing for that layer property, overriding the global `transition` values.

```json
"fill-opacity-transition": {{JSON.stringify(
    ref.$root.transition.example,
    null,
    2
)}}
```
<!--
START GENERATED CONTENT:
Content in this section is generated directly using the MapLibre Style
Specification. To update any content displayed in this section, make edits to:
https://github.com/maplibre/maplibre-gl-style-spec/blob/main/src/reference/v8.json.
-->
{{<Items headingLevel='2' entry={ref.transition} />}}
<!-- END GENERATED CONTENT -->

---
title: Style Specification
description: 'This specification defines and describes the visual appearance of a map: what data to draw, the order to draw it in, and how to style the data when drawing it.'
contentType: specification
navOrder: 4
order: 1
layout: page
hideFeedback: true
products:
- Style Specification
overviewHeader:
  title: Style Specification
  features: []
  ghLink: https://github.com/maplibre/maplibre-gl-style-spec/tree/main/src
  changelogLink: https://github.com/maplibre/maplibre-gl-style-spec/blob/main/CHANGELOG.md
---

A MapLibre style is a document that defines the visual appearance of a map: what data to draw, the order to draw it in, and how to style the data when drawing it. A style document is a [JSON](http://www.json.org/) object with specific root level and nested properties. This specification defines and describes these properties.

The intended audience of this specification includes:

- Advanced designers and cartographers who want to write styles by hand.
- Developers using style-related features of [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) or the [MapLibre Maps SDK for Android](https://github.com/maplibre/maplibre-gl-native).
- Authors of software that generates or processes MapLibre styles.

## Style document structure

A MapLibre style consists of a set of [root properties](/maplibre-gl-style-spec/style-spec/root), some of which describe a single global property, and some of which contain nested properties. Some root properties, like [`version`](/maplibre-gl-style-spec/style-spec/root/#version), [`name`](/maplibre-gl-style-spec/style-spec/root/#name), and [`metadata`](/maplibre-gl-style-spec/style-spec/root/#metadata), don't have any influence over the appearance or behavior of your map, but provide important descriptive information related to your map. Others, like [`layers`](/maplibre-gl-style-spec/style-spec/layers) and [`sources`](/maplibre-gl-style-spec/style-spec/sources), are critical and determine which map features will appear on your map and what they will look like. Some properties, like [`center`](/maplibre-gl-style-spec/style-spec/root/#center), [`zoom`](/maplibre-gl-style-spec/style-spec/root/#zoom), [`pitch`](/maplibre-gl-style-spec/style-spec/root/#pitch), and [`bearing`](/maplibre-gl-style-spec/style-spec/root/#bearing), provide the map renderer with a set of defaults to be used when initially displaying the map.

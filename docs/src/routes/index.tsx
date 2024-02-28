import {Markdown} from '~/components/markdown/markdown';

const md = `# Introduction

A MapLibre style is a document that defines the visual appearance of a map: what data to draw, the order to draw it in, and how to style the data when drawing it. A style document is a [JSON](http://www.json.org/) object with specific root level and nested properties. This specification defines and describes these properties.

The intended audience of this specification includes:

-   Advanced designers and cartographers who want to write styles by hand.
-   Developers using style-related features of [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) or the [MapLibre Native for Android and iOS](https://github.com/maplibre/maplibre-native).
-   Authors of software that generates or processes MapLibre styles.

## Style document structure

A MapLibre style consists of a set of [root properties](/root), some of which describe a single global property, and some of which contain nested properties. Some root properties, like [\`version\`](/root/#version), [\`name\`](/root/#name), and [\`metadata\`](/root/#metadata), don’t have any influence over the appearance or behavior of your map, but provide important descriptive information related to your map. Others, like [\`layers\`](/layers) and [\`sources\`](/sources), are critical and determine which map features will appear on your map and what they will look like. Some properties, like [\`center\`](/root/#center), [\`zoom\`](/root/#zoom), [\`pitch\`](/root/#pitch), and [\`bearing\`](/root/#bearing), provide the map renderer with a set of defaults to be used when initially displaying the map.
`;

function Introduction() {
    return <Markdown content={md} />;
}

export default Introduction;

import v8 from '../src/reference/v8.json' with { type: 'json' };
import fs from 'fs';
import jsonStringify from 'json-stringify-pretty-compact';

/**
 * This script generates markdown documentation from the JSON schema.
 * It leverages exitsing md files in the docs folder and adds generated files from the v8.json file.
 */

const BASE_PATH = 'docs';

type JsonSdkSupport = {
    [info: string]: {
        js?: string;
        android?: string;
        ios?: string;
    };
}

type JsonObject = {
    required?: boolean;
    units?: string;
    default?: string | number | boolean;
    type: string;
    doc: string;
    requires?: any[];
    example: string | object | number;
    expression?: { interpolated?: boolean; parameters?: string[]};
    transition?: boolean;
    values?: {[key: string]: { doc: string; 'sdk-support'?: JsonSdkSupport }} | number[];
    minimum?: number;
    maximum?: number;
}

/**
 * Capitalizes the first letter of the word.
 * @param word - the word to capitalize
 * @returns the capitalized word
 */
function capitalize(word: string) {
    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
}

/**
 * This is the main method which checks which files will need to be generated.
 * It uses some basic heuristics based on the v8 content.
 * @param key - the name of the json property
 * @param value - the value of the json property
 * @returns true if the element should be a topic, false otherwise
 */
function topicElement(key: string, value: JsonObject): boolean {
    return value.type !== 'number' &&
        value.type !== 'boolean' &&
        key !== 'center' &&
        value.type !== '*' &&
        value.type !== 'enum' &&
        key !== 'name' &&
        key !== 'sprite' &&
        key !== 'layers' &&
        key !== 'sources';

}

/**
 * @param obj - object to be formatted
 * @returns formatted JSON
 */
function formatJSON(obj: any): string {
    return jsonStringify(obj, {
        indent: 4,
        maxLength: 60
    });
}

/**
 * Converts the example value to markdown format.
 * @param key - the name of the json property
 * @param example - the example value of the json property
 * @returns the markdown string
 */
function exampleToMarkdown(key: string, example: string | object | number): string {
    return codeBlockMarkdown(`${key}: ${formatJSON(example)}`);
}

function codeBlockMarkdown(code: string, language = 'json'): string {
    return `\`\`\`${language}\n${code}\n\`\`\`\n`;
}

/** Renders the contents of a cell in the support matrix
 * @param support - the support string in the style spec
 * @returns Markdown for support cell
 */
function supportCell(support?: string) {
    // if no information is present in the style spec, we assume there is no support
    if (support === undefined) return 'Not supported yet';

    // if the string is an issue link, generate a link to it
    // there is no support yet but there is a tracking issue
    const maplibreIssue = /https:\/\/github.com\/maplibre\/[^/]+\/issues\/(\d+)/;
    const match  = support.match(maplibreIssue);
    if (match) return `❌ ([#${match[1]}](${support}))`;
    return support;
}

/**
 * Converts the sdk support object to markdown table format.
 * @param support - the sdk support object
 * @returns the markdown table string
 */
function sdkSupportToMarkdown(support: JsonSdkSupport): string {
    let markdown = '\n';
    const rows = Object.keys(support);
    markdown += '|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS\n';
    markdown += '|-----------|--------------|-----------|-------\n';
    for (const row of rows) {
        const supportMatrix = support[row];
        markdown += `|${row}|${supportCell(supportMatrix.js)}|${supportCell(supportMatrix.android)}|${supportCell(supportMatrix.ios)}|\n`;
    }
    return markdown;

}

/**
 * The requires field has some syntax which can contain "!" and "source".
 * @param requires - a list of requirements for the property
 * @returns a text that a user can read
 */
function requiresToMarkdown(requires: any[]): string {
    let markdown = '';
    for (const require of requires) {
        if (require['!']) {
            markdown += `Disabled by \`${require['!']}\`. `;
        } else if (require['source']) {
            markdown += `Requires source to be \`${require.source}\`. `;
        } else if (typeof require === 'string') {
            markdown += `Requires \`${require}\`. `;
        } else if (typeof require === 'object') {
            for (const [key, value] of Object.entries(require)) {
                markdown += `Requires \`${key}\` to be `;
                if (Array.isArray(value)) {
                    if (value.length > 1) {
                        markdown += 'one of ';
                    }
                    markdown += `${value.map((x) => `\`${x}\``).join(', ')}. `;
                } else {
                    markdown += `\`${value}\`. `;
                }
            }
        }
    }
    return markdown;
}

/**
 * Converts the type to markdown link format - the link should be to the relevant section in the right file.
 * @param type - the type of the property
 * @returns the markdown link string
 */
function typeToMarkdownLink(type: string): string {
    switch (type.toLocaleLowerCase()) {
        case '*':
        case 'variableanchoroffsetcollection':
            return '';
        case 'promoteid':
            return ` [${type}](types.md)`;
        case 'color':
        case 'number':
        case 'string':
        case 'boolean':
        case 'array':
        case 'enum':
        case 'formatted':
        case 'resolvedimage':
        case 'padding':
            return ` [${type}](types.md#${type.toLocaleLowerCase()})`;
        case 'filter':
            return ` [${type}](expressions.md)`;
        case 'paint':
        case 'layout':
            return ` [${type}](layers.md#${type.toLocaleLowerCase()})`;
        default:
            // top level types have their own file
            return ` [${type}](${type}.md)`;
    }
}

function formatRange(minimum?: number, maximum?: number) {
    const from = minimum === undefined ? '(-∞' : `[${minimum}`;
    const to = maximum === undefined ? '∞)' : `${maximum}]`;
    return `${from}, ${to}`;
}

/**
 * Converts the property to markdown format - this is a property with example, sdk support, default and other details.
 * @param key - the name of the json property
 * @param value - the value of the json property
 * @param keyPrefix - the prefix to be used for the markdown header
 * @param paintLayoutText - the text to be used for the paint/layout property
 * @returns the markdown string
 */
function convertPropertyToMarkdown(key: string, value: JsonObject, keyPrefix = '##', paintLayoutText = '') {
    let markdown = `${keyPrefix} ${key}\n*`;
    if (paintLayoutText) {
        markdown += `[${paintLayoutText}](#${paintLayoutText.toLowerCase()}) property. `;
    }
    const mdLink = typeToMarkdownLink(value.type);
    if (value.required) {
        markdown += `Required${mdLink}`;
    } else {
        markdown += `Optional${mdLink}`;
    }

    if (value.minimum !== undefined || value.maximum !== undefined) {
        markdown += ` in range ${formatRange(value.minimum, value.maximum)}`;
    }

    markdown += '. ';

    const isEnum = value.type === 'enum' && value.values && !Array.isArray(value.values);
    if (isEnum) {
        markdown += `Possible values: \`${Object.keys(value.values).join('`, `')}\`. `;
    }
    if (value.units) {
        markdown += `Units in ${value.units}. `;
    }
    if (value.default !== undefined) {
        markdown += `Defaults to \`${value.default}\`. `;
    }
    if (value.requires) {
        markdown += requiresToMarkdown(value.requires);
    }
    if (value.expression?.interpolated) {
        if (value.expression.parameters.includes('feature-state')) {
            markdown += 'Supports [feature-state](expressions.md#feature-state) and [interpolate](expressions.md#interpolate) expressions. ';
        }  else {
            markdown += 'Supports [interpolate](expressions.md#interpolate) expressions. ';
        }
    }
    if (value.transition) {
        markdown += 'Transitionable. ';
    }

    markdown = `${markdown.trim()}*\n\n${value.doc}\n\n`;

    if (isEnum) {
        for (const [enumKey, enumValue] of Object.entries(value.values)) {
            markdown += `* \`${enumKey}\`: ${enumValue.doc}\n`;
        }
    }

    if (value.example !== undefined) {
        markdown += exampleToMarkdown(key, value.example as string);
    }

    if (value['sdk-support']) {
        markdown += sdkSupportToMarkdown(value['sdk-support']);
    }
    markdown += '\n';
    return markdown;
}

/**
 * Creates the root markdown file.
 */
function createRootContent() {
    let rootContent = `# Root

Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


${codeBlockMarkdown(`
{
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {... },
    "layers": [...]
}
`)}

`;
    for (const [key, value] of Object.entries(v8.$root)) {
        rootContent += convertPropertyToMarkdown(key, value);
    }
    fs.writeFileSync(`${BASE_PATH}/root.md`, rootContent);
}

/**
 * Creates the layers markdown file.
 */
function createLayersContent() {
    let content = '# Layers\n\n';

    content += `${v8.$root.layers.doc}\n\n`;
    content += exampleToMarkdown('layers', v8.$root.layers.example);

    content += '## Layer Properties\n\n';

    for (const [key, value] of Object.entries(v8.layer)) {
        content += convertPropertyToMarkdown(key, value as JsonObject, '###');
    }

    for (const layoutKey of Object.keys(v8).filter(key => key.startsWith('layout_'))) {
        const layerName = layoutKey.replace('layout_', '');
        content += `## ${capitalize(layerName)}\n\n`;
        for (const [key, value] of Object.entries(v8[layoutKey])) {
            content += convertPropertyToMarkdown(key, value as JsonObject, '###', 'Layout');
        }
        for (const [key, value] of Object.entries(v8[`paint_${layerName}`])) {
            content += convertPropertyToMarkdown(key, value as JsonObject, '###', 'Paint');
        }
    }

    fs.writeFileSync(`${BASE_PATH}/layers.md`, content);
}

/**
 * Creates the sources markdown file.
 */
function createSourcesContent() {
    const sourcesExtraData = {
        vector: {
            doc: 'A vector tile source. Tiles must be in [Mapbox Vector Tile format](https://github.com/mapbox/vector-tile-spec). All geometric coordinates in vector tiles must be between \`-1 * extent\` and \`(extent * 2) - 1\` inclusive. All layers that use a vector source must specify a [`source-layer`](layers.md#source-layer) value.',
            example: {
                'maplibre-streets': {
                    'type': 'vector',
                    'tiles': [
                        'http://a.example.com/tiles/{z}/{x}/{y}.pbf'
                    ],
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.10.0',
                    android: '2.0.1',
                    ios: '2.0.0'
                }
            }
        },
        raster: {
            doc: 'A raster tile source.',
            example: {
                'maplibre-satellite': {
                    'type': 'raster',
                    'tiles': [
                        'http://a.example.com/tiles/{z}/{x}/{y}.png'
                    ],
                    'tileSize': 256
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.10.0',
                    android: '2.0.1',
                    ios: '2.0.0'
                }
            }
        },
        'raster-dem': {
            doc: 'A raster DEM source. Only supports [Mapbox Terrain RGB](https://blog.mapbox.com/global-elevation-data-6689f1d0ba65) and Mapzen Terrarium tiles.',
            example: {
                'maplibre-terrain-rgb': {
                    'type': 'raster-dem',
                    'encoding': 'mapbox',
                    'tiles': [
                        'http://a.example.com/dem-tiles/{z}/{x}/{y}.png'
                    ],
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.43.0',
                    android: '6.0.0',
                    ios: '4.0.0'
                }
            }
        },
        geojson: {
            doc: 'A [GeoJSON](http://geojson.org/) source. Data must be provided via a \`"data"\` property, whose value can be a URL or inline GeoJSON. When using in a browser, the GeoJSON data must be on the same domain as the map or served with [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers.',
            example: {
                'geojson-marker': {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [12.550343, 55.665957]
                        },
                        'properties': {
                            'title': 'Somewhere',
                            'marker-symbol': 'monument'
                        }
                    }
                },
                'geojson-lines': {
                    'type': 'geojson',
                    'data': './lines.geojson'
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.10.0',
                    android: '2.0.1',
                    ios: '2.0.0'
                },
                clustering: {
                    js: '0.14.0',
                    android: '4.2.0',
                    ios: '3.4.0'
                },
                'line distance metrics': {
                    js: '0.45.0',
                    android: '6.5.0',
                    ios: '4.4.0'
                }
            }
        },
        image: {
            doc: 'An image source. The `url` value contains the image location. The `coordinates` array contains `[longitude, latitude]` pairs for the image corners listed in clockwise order: top left, top right, bottom right, bottom left.',
            example: {
                'image': {
                    'type': 'image',
                    'url': 'https://maplibre.org/maplibre-gl-js/docs/assets/radar.gif',
                    'coordinates': [
                        [-80.425, 46.437],
                        [-71.516, 46.437],
                        [-71.516, 37.936],
                        [-80.425, 37.936]
                    ]
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.10.0',
                    android: '5.2.0',
                    ios: '3.7.0'
                }
            }
        },
        video: {
            doc: 'A video source. The `urls` value is an array. For each URL in the array, a video element [source](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source) will be created. To support the video across browsers, supply URLs in multiple formats.\n\nThe `coordinates` array contains `[longitude, latitude]` pairs for the video corners listed in clockwise order: top left, top right, bottom right, bottom left.\n\nWhen rendered as a [raster layer](layers.md#raster), the layer\'s [`raster-fade-duration`](layers.md#raster-fade-duration) property will cause the video to fade in. This happens when playback is started, paused and resumed, or when the video\'s coordinates are updated. To avoid this behavior, set the layer\'s [`raster-fade-duration`](layers.md#raster-fade-duration) property to `0`.',
            example: {
                'video': {
                    'type': 'video',
                    'urls': [
                        'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
                        'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm'
                    ],
                    'coordinates': [
                        [-122.51596391201019, 37.56238816766053],
                        [-122.51467645168304, 37.56410183312965],
                        [-122.51309394836426, 37.563391708549425],
                        [-122.51423120498657, 37.56161849366671]
                    ]
                }
            },
            'sdk-support': {
                'basic functionality': {
                    js: '0.10.0'
                }
            }
        }
    };

    let content = '# Sources\n\n';

    content += `${v8.$root.sources.doc}\n\n`;
    content += exampleToMarkdown('sources', v8.$root.sources.example);

    for (const sourceKey of v8.source) {
        const srouceName = sourceKey.replace('source_', '').replace('_', '-');
        content += `## ${srouceName}\n\n`;
        content += `${sourcesExtraData[srouceName].doc}\n\n`;
        content += exampleToMarkdown('sources', sourcesExtraData[srouceName].example);
        content += sdkSupportToMarkdown(sourcesExtraData[srouceName]['sdk-support']);
        content += '\n';
        for (const [key, value] of Object.entries(v8[sourceKey])) {
            if (key === '*') continue;
            content += convertPropertyToMarkdown(key, value as JsonObject, '###');
        }
    }

    fs.writeFileSync(`${BASE_PATH}/sources.md`, content);
}

/**
 * Creates the expressions markdown file.
 * This uses the expressions_patrial.md file as a base and adds the expressions from the v8.json file.
 */
function createExpressionsContent() {
    let content = fs.readFileSync('build/expressions_patrial.md', 'utf-8');

    const groupsSet = new Set<string>();
    for (const value of Object.values(v8.expression_name.values)) {
        groupsSet.add(value.group);
    }
    for (const group of groupsSet) {
        content += `## ${group}\n\n`;
        for (const [key, value] of Object.entries(v8.expression_name.values)) {
            if (v8.expression_name.values[key].group !== group) {
                continue;
            }
            content += `\n### ${key}\n`;
            content += `${value.doc}\n`;
            value.example.syntax.method.unshift(`"${key}"`);
            content += `\nSyntax:\n${codeBlockMarkdown(`[${value.example.syntax.method.join(', ')}]: ${value.example.syntax.result}`, 'js')}\n`;
            content += `\nExample:\n${codeBlockMarkdown(`"some-property": ${formatJSON(value.example.value)}`)}\n`;
            content += sdkSupportToMarkdown(value['sdk-support'] as any);
            content += '\n';
        }
    }

    fs.writeFileSync(`${BASE_PATH}/expressions.md`, content);
}

/**
 * Creates the main topics markdown files.
 */
function createMainTopics() {
    for (const [key, value] of Object.entries(v8.$root)) {
        if (!topicElement(key, value)) {
            continue;
        }
        let content = `# ${capitalize(key)}\n\n`;
        content += `${value.doc}\n\n`;
        content += exampleToMarkdown(key, value.example);

        if (value.type in v8) {
            for (const [subKey, subValue] of Object.entries(v8[value.type])) {
                content += convertPropertyToMarkdown(subKey, subValue as JsonObject);
            }
        }
        fs.writeFileSync(`${BASE_PATH}/${key}.md`, content);
    }
}

// Main Flow start here!
createRootContent();
createLayersContent();
createSourcesContent();
createExpressionsContent();
createMainTopics();

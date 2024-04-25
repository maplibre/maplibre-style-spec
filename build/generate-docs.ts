import v8 from '../src/reference/v8.json' assert { type: 'json' };
import fs from 'fs';

const BASE_PATH = 'docs';

type JsonSdkSupport = {
    [info: string]: {
        [platform: string]: [string];
    };
}

type JsonObject = {
    required?: boolean;
    units?: string;
    default?: string | number | boolean;
    type: string;
    doc: string;
    example: string | object | number;
    expression?: { interpolated?: boolean };
    transition?: boolean;
    values?: {[key: string]: { doc: string; 'sdk-support'?: JsonSdkSupport }} | number[];
}

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

function exampleToMarkdown(key: string, example: string | object | number): string {
    return `\`\`\`json\n${key}: ${JSON.stringify(example, null, 4)}\n\`\`\`\n`;
}

function sdkSupportToMarkdown(support: JsonSdkSupport): string {
    let markdown = '\n';
    const rows = Object.keys(support);
    markdown += `| |${Object.keys(support[rows[0]]).join(' | ')}|\n`;
    markdown += `|${'-|-'.repeat(Object.keys(support[rows[0]]).length)}|\n`;
    for (const row of rows) {
        markdown += `|${row}|${Object.values(support[row]).join(' | ')}|\n`;
    }
    return markdown;

}

function convertToMarkdown(key: string, value: JsonObject, keyPrefix = '##') {
    let markdown = `${keyPrefix} ${key}\n*`;
    const valueType = value.type === '*' ? '' : ` \`${value.type}\``;
    if (value.required) {
        markdown += `Required${valueType}. `;
    } else {
        markdown += `Optional${valueType}. `;
    }
    const isEnum = value.type === 'enum' && value.values && !Array.isArray(value.values);
    if (isEnum) {
        markdown += `Possible values: \`${Object.keys(value.values).join('`, `')}\`. `;
    }
    if (value.units) {
        markdown += `Units in ${value.units}. `;
    }
    if (value.default !== undefined) {
        markdown += `Defaults to ${value.default}. `;
    }
    if (value.expression?.interpolated) {
        markdown += 'Supports interpolate expressions. ';
    }
    if (value.transition) {
        markdown += 'Supports transition. ';
    }
    // Remove extra space at the end
    markdown = `${markdown.substring(0, markdown.length - 2)}*\n\n${value.doc}\n\n`;

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

function createRootContent() {
    let rootContent = `# Root

Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


\`\`\`json
{
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {... },
    "layers": [...]
}
\`\`\`

`;
    for (const [key, value] of Object.entries(v8.$root)) {
        rootContent += convertToMarkdown(key, value);
    }
    fs.writeFileSync(`${BASE_PATH}/root.md`, rootContent);
}

function capitalize(word: string) {
    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
}

function createLayersContent() {
    let content = '# Layers\n\n';

    content += `${v8.$root.layers.doc}\n\n`;
    content += exampleToMarkdown('layers', v8.$root.layers.example);

    content += '## Layer Properties\n\n';

    for (const [key, value] of Object.entries(v8.layer)) {
        content += convertToMarkdown(key, value as JsonObject, '###');
    }

    for (const layoutKey of Object.keys(v8).filter(key => key.startsWith('layout_'))) {
        const layerName = layoutKey.replace('layout_', '');
        content += `## ${capitalize(layerName)}\n\n`;
        for (const [key, value] of Object.entries(v8[layoutKey])) {
            content += convertToMarkdown(key, value as JsonObject, '###');
        }
        for (const [key, value] of Object.entries(v8[`paint_${layerName}`])) {
            content += convertToMarkdown(key, value as JsonObject, '###');
        }
    }

    fs.writeFileSync(`${BASE_PATH}/layers.md`, content);

    return content;
}

function createSourcesContent() {
    let content = '# Sources\n\n';

    content += `${v8.$root.sources.doc}\n\n`;
    content += exampleToMarkdown('sources', v8.$root.sources.example);

    for (const sourceKey of v8.source) {
        content += `## ${sourceKey.replace('source_', '').replace('_', '-')}\n\n`;
        for (const [key, value] of Object.entries(v8[sourceKey])) {
            if (key === '*') continue;
            content += convertToMarkdown(key, value as JsonObject, '###');
        }
    }

    fs.writeFileSync(`${BASE_PATH}/sources.md`, content);

    return content;
}

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
            content += sdkSupportToMarkdown(value['sdk-support'] as any);
            content += '\n';
        }
    }

    fs.writeFileSync(`${BASE_PATH}/expressions.md`, content);
}

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
                content += convertToMarkdown(subKey, subValue as JsonObject);
            }
        }
        fs.writeFileSync(`${BASE_PATH}/${key}.md`, content);
    }
}

function createChangelog() {
    let content = fs.readFileSync('CHANGELOG.md', 'utf-8');
    content = `# Changelog\n\n${content.substring(content.match(/## [0-9]+\.[0-9]+\.[0-9]+/).index)}`;
    fs.writeFileSync(`${BASE_PATH}/changelog.md`, content);
}

// Main Flow start here!
createRootContent();
createLayersContent();
createSourcesContent();
createExpressionsContent();
createMainTopics();
createChangelog();


import v8 from "../src/reference/v8.json" assert { type: "json" };
import fs from "fs";

const BASE_PATH = "docs";

type JsonObject = {
    required?: boolean;
    units?: string;
    default?: string | number | boolean;
    type: string;
    doc: string;
    example: string | object | number;
    expression?: { interpolated?: boolean };
    transition?: boolean;
}

function topicElement(key: string, value: JsonObject): boolean {
    return value.type !== "number" && value.type !== "boolean" && key !== "center" && value.type !== "*" && value.type !== "enum" && key !== "name";

}

function convertToMarkdown(key: string, value: JsonObject) {
    let markdown = `## ${key}\n*`;
    if (value.required) {
        markdown += `Required ${value.type}. `;
    } else {
        markdown += `Optional ${value.type}. `;
    }
    if (value.units) {  
        markdown += `Units in ${value.units}. `;
    }
    if (value.default !== undefined) {
        markdown += `Defaults to ${value.default}. `;
    }
    if (value.expression?.interpolated) {
        markdown += `Supports interpolate expressions. `
    }
    if (value.transition) {
        markdown += `Supports transition. `
    }
    // Remove extra space at the end
    markdown = markdown.substring(0, markdown.length -2) + `*\n\n${value.doc}\n\n`;

    if (value.example !== undefined) {
        markdown += "```json\n" + JSON.stringify(value.example, null, 4) + "\n```\n";
    }

    markdown += "\n";
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

`
    for (const [key, value] of Object.entries(v8.$root)) {
        rootContent += convertToMarkdown(key, value);
    }
    fs.writeFileSync(`${BASE_PATH}/root.md`, rootContent);
}

function capitalize(word) {
    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
}

function createMainTopics() {
    for (const [key, value] of Object.entries(v8.$root)) {
        if (!topicElement(key, value)) {
            continue;
        }
        let content = `# ${capitalize(key)}\n\n`;
        content += value.doc + "\n\n";
        content += "```json" + JSON.stringify(value.example, null, 4) + "\n```\n";

        if (value.type in v8) {
            for (const [subKey, subValue] of Object.entries(v8[value.type])) {
                content += convertToMarkdown(subKey, subValue as JsonObject);
            }
        }
        fs.writeFileSync(`${BASE_PATH}/${key}.md`, content);
    }
}



// Main Flow start here!
createRootContent();
createMainTopics();


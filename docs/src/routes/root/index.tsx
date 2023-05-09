import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';
import {Items} from '../../components/items/items';
function Root() {

    const md = `# Root
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

    return (
        <div>
            <Markdown content={md} />
            <Items headingLevel='2' entry={ref.$root} />
        </div>
    );
}

export default Root;

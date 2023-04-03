import {Markdown} from '~/components/markdown';
import ref from '../reference/latest';
import {Items} from '../components/style-spec/specs/items';
function Root() {

    const md = `# Root
Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


\`\`\`json
{
    "version": 8,
        "name": "Mapbox Streets",
            "sprite": "mapbox://sprites/mapbox/streets-v8",
                "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
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

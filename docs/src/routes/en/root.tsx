import {SolidMd} from '~/utils/SolidMd';
export const title = 'Root';
import ref from '../../reference/latest';
import {Items} from '../../components/style-spec/specs/items';
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
            <SolidMd content={md} />

            {/* START GENERATED CONTENT:
Content in this section is generated directly using the MapLibre Style
Specification. To update any content displayed in this section, make edits to:
https://github.com/maplibre/maplibre-gl-js/blob/main/src/style-spec/reference/v8.json. */}
            <Items headingLevel='2' entry={ref.$root} />
            {/* END GENERATED CONTENT */}
        </div>
    );
}

export default Root;

import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';
import {Items} from '../../components/items/items';
function Root() {

    const md = `# Terrain

Add 3D terrain to the map.

\`\`\`json
"terrain": ${JSON.stringify(ref.$root.terrain.example, null, 2)}
\`\`\`

`;
    return (
        <div>
            <Markdown content={md} />
            <Items headingLevel='3' entry={ref.terrain} />
        </div>
    );
}

export default Root;

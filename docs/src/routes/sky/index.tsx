import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';
import {Items} from '../../components/items/items';
function Sky() {

    const md = `# Sky

Add sky and fog to the map.

This feature is still under development and is not yet available in the latest release.

\`\`\`json
"sky": ${JSON.stringify(ref.$root.sky.example, null, 2)}
\`\`\`

`;

    return (
        <div>
             <Markdown content={md} />
            <Items headingLevel='3' entry={ref.sky} /> 
        </div>
    );
}

export default Sky;

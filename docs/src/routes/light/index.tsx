import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';
import {Items} from '../../components/items/items';
function Light() {

    const md = `# Light
    
A style's \`light\` property provides a global light source for that style. Since this property is the light used to light extruded features, you will only see visible changes to your map style when modifying this property if you are using extrusions.

\`\`\`json
"light": ${JSON.stringify(
        ref.$root.light.example,
        null,
        2
    )}
\`\`\`
`;

    return (
        <div>
            <Markdown content={md} />

            <Items headingLevel='2' entry={ref.light} />
        </div>
    );
}

export default Light;

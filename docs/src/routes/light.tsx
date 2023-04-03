import {SolidMd} from '~/utils/SolidMd';
export const title = 'Root';
import ref from '../reference/latest';
import {Items} from '../components/style-spec/specs/items';
function Root() {

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
            <SolidMd content={md} />

            <Items headingLevel='2' entry={ref.light} />
            {/* END GENERATED CONTENT */}
        </div>
    );
}

export default Root;

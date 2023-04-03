import {SolidMd} from '~/utils/SolidMd';
export const title = 'Transition';
import ref from '../reference/latest';
import {Items} from '../components/style-spec/specs/items';
function Transition() {

    const md = `# Transition
A \`transition\` property controls timing for the interpolation between a transitionable style property's previous value and new value. A style's [root \`transition\`](/root/#transition) property provides global transition defaults for that style.
\`\`\`json
"transition": ${JSON.stringify(
        ref.$root.transition.example,
        null,
        2
    )}
\`\`\`
Any transitionable layer property, may also have its own \`*-transition\` property that defines specific transition timing for that layer property, overriding the global \`transition\` values.

\`\`\`json
"fill-opacity-transition": ${JSON.stringify(
        ref.$root.transition.example,
        null,
        2
    )}
\`\`\`

`;

    return (
        <div>
            <SolidMd content={md} />
            <Items headingLevel='2' entry={ref.transition} />

        </div>
    );
}

export default Transition;

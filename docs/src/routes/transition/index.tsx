import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../src/reference/latest';
import {Items} from '../../components/items/items';
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

## Transition Options
`;

    return (
        <div>
            <Markdown content={md} />
            <Items headingLevel='3' entry={ref.transition} />

        </div>
    );
}

export default Transition;

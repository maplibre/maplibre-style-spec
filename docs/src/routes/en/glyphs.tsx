import {SolidMd} from '~/utils/SolidMd';
// import CodeBlock from "~/utils/CodeBlock";
export const title = 'Glyphs';

function glyphs() {
    const md = `A style's \`glyphs\` property provides a URL template for loading signed-distance-field glyph sets in PBF format.

\`\`\`json
"glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
\`\`\`
    
This URL template should include two tokens:

- \`{fontstack}\` When requesting glyphs, this token is replaced with a comma separated list of fonts from a font stack specified in the [\`text-font\`](/maplibre-gl-js-docs/style-spec/layers/#layout-symbol-text-font) property of a symbol layer.
- \`{range}\` When requesting glyphs, this token is replaced with a range of 256 Unicode code points. For example, to load glyphs for the [Unicode Basic Latin and Basic Latin-1 Supplement blocks](https://en.wikipedia.org/wiki/Unicode_block), the range would be \`0-255\`. The actual ranges that are loaded are determined at runtime based on what text needs to be displayed.
`;

    return <SolidMd content={md} />;
}

export default glyphs;

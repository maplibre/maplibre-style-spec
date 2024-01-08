import{M as t}from"./markdown-4a315ef3.js";import{s as o}from"./v8-3eae868e.js";import{c as s}from"./entry-client-d72d8ff6.js";function r(){const e=`
# Glyphs

A style's \`glyphs\` property provides a URL template for loading signed-distance-field glyph sets in PBF format.

\`\`\`json
"glyphs": ${JSON.stringify(o.$root.glyphs.example,null,2)}
\`\`\`
    
This URL template should include two tokens:

- \`{fontstack}\` When requesting glyphs, this token is replaced with a comma separated list of fonts from a font stack specified in the [\`text-font\`](/maplibre-style-spec/layers/#layout-symbol-text-font) property of a symbol layer.
- \`{range}\` When requesting glyphs, this token is replaced with a range of 256 Unicode code points. For example, to load glyphs for the [Unicode Basic Latin and Basic Latin-1 Supplement blocks](https://en.wikipedia.org/wiki/Unicode_block), the range would be \`0-255\`. The actual ranges that are loaded are determined at runtime based on what text needs to be displayed.
`;return s(t,{content:e})}export{r as default};

import{g as i,i as o,c as s,t as n}from"./entry-client-7968611c.js";import{M as r}from"./markdown-3061e333.js";import{s as a}from"./v8-0d273547.js";const p=n("<div>");function m(){const t=`
# Sprite

A style's \`sprite\` property supplies a URL template for loading small images to use in rendering \`background-pattern\`, \`fill-pattern\`, \`line-pattern\`,\`fill-extrusion-pattern\` and \`icon-image\` style properties.

\`\`\`json
"sprite": ${JSON.stringify(a.$root.sprite.example,null,2)}
\`\`\`

A valid sprite source must supply two types of files:

- An _index file_, which is a JSON document containing a description of each image contained in the sprite. The content of this file must be a JSON object whose keys form identifiers to be used as the values of the above style properties, and whose values are objects describing the dimensions (\`width\` and \`height\` properties) and pixel ratio (\`pixelRatio\`) of the image and its location within the sprite (\`x\` and{' '} \`y\`). For example, a sprite containing a single image might have the following index file contents:

  \`\`\`json
  {
      "poi": {
          "width": 32,
          "height": 32,
          "x": 0,
          "y": 0,
          "pixelRatio": 1
      }
  }
  \`\`\`

  Then the style could refer to this sprite image by creating a symbol layer with the layout property \`"icon-image": "poi"\`, or with the tokenized value  \`"icon-image": "{icon}"\` and vector tile features with a \`icon\` property with the value \`poi\`.

- _Image files_, which are PNG images containing the sprite data.

Apart from the required \`width\`, \`height\`, \`x\`, \`y\`, and \`pixelRatio\` properties, the following optional properties are supported:

- \`content\`: An array of four numbers, with the first two specifying the left, top corner, and the last two specifying the right, bottom corner. If present, and if the icon uses [\`icon-text-fit\`](/maplibre-style-spec/layers/#layout-symbol-icon-text-fit), the symbol's text will be fit inside the content box.
- \`stretchX\`: An array of two-element arrays, consisting of two numbers that represent the _from_ position and the _to_ position of areas that can be stretched.
- \`stretchY\`: Same as \`stretchX\`, but for the vertical dimension.
- \`sdf\`: Boolean. If \`true\` then the image is handled as a signed-distance field (SDF) and its color can be set at runtime using the [\`icon-color\`](/maplibre-style-spec/layers/#paint-symbol-icon-color) and [\`icon-halo-color\`](/maplibre-style-spec/layers/#paint-symbol-icon-halo-color) properties. Defaults to \`false\`.

MapLibre SDKs will use the value of the \`sprite\` property in the style to generate the URLs for loading both files. First, for both file types, it will append \`@2x\` to the URL on high-DPI devices. Second, it will append a file extension: \`.json\` for the index file, and \`.png\` for the image file. For example, if you specified \`"sprite": "https://example.com/sprite"\`, renderers would load \`https://example.com/sprite.json\` and \`https://example.com/sprite.png\`, or \`https://example.com/sprite@2x.json\` and \`https://example.com/sprite@2x.png\`.

`;return(()=>{const e=i(p);return o(e,s(r,{content:t})),e})()}export{m as default};

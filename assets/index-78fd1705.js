import{g as h,a as i,i as r,c as o,t as u}from"./entry-client-a3f1771d.js";import{M as c}from"./markdown-ec4c906a.js";import{s}from"./v8-e841e8c5.js";import{I as y}from"./items-f795eb2b.js";import"./property-5979cffc.js";import"./subtitle-4c59d3b7.js";const f=u("<div><!#><!/><!#><!/>");function v(){const l=`# Light
    
A style's \`light\` property provides a global light source for that style. Since this property is the light used to light extruded features, you will only see visible changes to your map style when modifying this property if you are using extrusions.

\`\`\`json
"light": ${JSON.stringify(s.$root.light.example,null,2)}
\`\`\`
`;return(()=>{const t=h(f),n=t.firstChild,[e,a]=i(n.nextSibling),g=e.nextSibling,[p,m]=i(g.nextSibling);return r(t,o(c,{content:l}),e,a),r(t,o(y,{headingLevel:"2",get entry(){return s.light}}),p,m),t})()}export{v as default};

import{g as c,a as o,i as r,c as s,t as f}from"./entry-client-d72d8ff6.js";import{M as g}from"./markdown-4a315ef3.js";import{s as d}from"./v8-3eae868e.js";import{I as h}from"./items-b922ad8c.js";import"./property-31698dc6.js";import"./subtitle-3d5d83da.js";const u=f("<div><!#><!/><!#><!/>");function M(){const i=`# Root
Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


\`\`\`json
{
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {... },
    "layers": [...]
}
\`\`\`

`;return(()=>{const e=c(u),n=e.firstChild,[t,a]=o(n.nextSibling),l=t.nextSibling,[p,m]=o(l.nextSibling);return r(e,s(g,{content:i}),t,a),r(e,s(h,{headingLevel:"2",get entry(){return d.$root}}),p,m),e})()}export{M as default};

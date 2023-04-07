import{g as c,a as o,i as r,c as s,t as f}from"./entry-client-e66f88b6.js";import{M as d}from"./markdown-caad30ca.js";import{s as g}from"./v8-c0965a88.js";import{I as u}from"./items-98146b5a.js";import"./property-9aa3b88c.js";import"./subtitle-7af82e94.js";const b=f("<div><!#><!/><!#><!/>");function M(){const i=`# Root
Root level properties of a MapLibre style specify the map's layers, tile sources and other resources, and default values for the initial camera position when not specified elsewhere.


\`\`\`json
{
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "mapbox://sprites/mapbox/streets-v8",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {... },
    "layers": [...]
}
\`\`\`

`;return(()=>{const e=c(b),a=e.firstChild,[t,n]=o(a.nextSibling),l=t.nextSibling,[p,m]=o(l.nextSibling);return r(e,s(d,{content:i}),t,n),r(e,s(u,{headingLevel:"2",get entry(){return g.$root}}),p,m),e})()}export{M as default};

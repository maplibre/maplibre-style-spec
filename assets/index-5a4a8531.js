import{g as f,a as o,i as r,c as e,t as g}from"./entry-client-7968611c.js";import{M as c}from"./markdown-3061e333.js";import{s as n}from"./v8-0d273547.js";import{I as u}from"./items-13136237.js";import"./property-30881353.js";import"./subtitle-801bb580.js";const $=g("<div><!#><!/><!#><!/>");function S(){const a=`# Transition
A \`transition\` property controls timing for the interpolation between a transitionable style property's previous value and new value. A style's [root \`transition\`](/root/#transition) property provides global transition defaults for that style.
\`\`\`json
"transition": ${JSON.stringify(n.$root.transition.example,null,2)}
\`\`\`
Any transitionable layer property, may also have its own \`*-transition\` property that defines specific transition timing for that layer property, overriding the global \`transition\` values.

\`\`\`json
"fill-opacity-transition": ${JSON.stringify(n.$root.transition.example,null,2)}
\`\`\`

## Transition Options
`;return(()=>{const t=f($),s=t.firstChild,[i,l]=o(s.nextSibling),p=i.nextSibling,[m,y]=o(p.nextSibling);return r(t,e(c,{content:a}),i,l),r(t,e(u,{headingLevel:"3",get entry(){return n.transition}}),m,y),t})()}export{S as default};

import{g as f,k as r,i as e,c as o,t as g}from"./web-Btggxc92.js";import{M as $}from"./markdown-DfzxaKvK.js";import{s as i}from"./v8-D95HWaCp.js";import{I as c}from"./items-DvJ1tBUm.js";import"./property-BqnCpERi.js";import"./components-BqRe3wZe.js";import"./subtitle-oIDeCC3O.js";var u=g("<div><!$><!/><!$><!/>");function w(){const a=`# Transition
A \`transition\` property controls timing for the interpolation between a transitionable style property's previous value and new value. A style's [root \`transition\`](/maplibre-style-spec/root/#transition) property provides global transition defaults for that style.
\`\`\`json
"transition": ${JSON.stringify(i.$root.transition.example,null,2)}
\`\`\`
Any transitionable layer property, may also have its own \`*-transition\` property that defines specific transition timing for that layer property, overriding the global \`transition\` values.

\`\`\`json
"fill-opacity-transition": ${JSON.stringify(i.$root.transition.example,null,2)}
\`\`\`

## Transition Options
`;return(()=>{var t=f(u),s=t.firstChild,[n,l]=r(s.nextSibling),p=n.nextSibling,[m,y]=r(p.nextSibling);return e(t,o($,{content:a}),n,l),e(t,o(c,{headingLevel:"3",get entry(){return i.transition}}),m,y),t})()}export{w as default};

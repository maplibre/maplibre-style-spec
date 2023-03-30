import Markdoc from "@markdoc/markdoc";
import render from "solidjs-markdoc";
// import SolidMarkdown from "solid-markdown";
import MarkdownIt from "markdown-it";
//var hljs = require('highlight.js'); // https://highlightjs.org


import prism from 'markdown-it-prism';
// import 'prismjs/themes/prism.css';
import '../styles/prismjs-theme.scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
// add dark inline highlighting
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

// import 'highlight.js/styles/tokyo-night-dark.css';

const md = new MarkdownIt();

md.use(prism, {highlightInlineCode: true, defaultLanguage: 'typescript'})


export function SolidMd ({content}:{content:string}){
    return <div innerHTML={md.render(content)} />;
}

// export function SolidMd ({content}:{content:string}){
    
//     return <SolidMarkdown children={content} />
// }

// export function SolidMd ({content}:{content:string}){
//     return render(Markdoc.transform(Markdoc.parse(content)));
// }


// const md = new MarkdownIt({
//     highlight: function (str, lang) {

//         console.log('highlight')

//       if (lang && hljs.getLanguage(lang)) {
//         console.log( str)
//         try {
//           return hljs.highlight(str, { language: lang }).value;
//         } catch (__) {}
//       }
  
//       return ``; // use external default escaping
//     }
// });
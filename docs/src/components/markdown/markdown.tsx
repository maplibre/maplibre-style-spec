import MarkdownIt from 'markdown-it';
// @ts-ignore
import deflist from 'markdown-it-deflist';
import anchor from 'markdown-it-anchor';
import prism from 'markdown-it-prism';
import './prismjs-theme.scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

const md = new MarkdownIt();

md.use(prism, {highlightInlineCode: true, defaultLanguage: 'typescript'}).use(deflist).use(anchor, {
    permalink: anchor.permalink.headerLink({safariReaderFix: true})
});

export function Markdown (props:{content:string}) {
    return <div innerHTML={md.render(props.content)} />;
}

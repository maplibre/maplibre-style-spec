import remark from 'remark';
import ReactMarkdown from 'react-markdown'

import { h } from 'preact'
export default function md(str) {

    return  <ReactMarkdown>{str}</ReactMarkdown>
}

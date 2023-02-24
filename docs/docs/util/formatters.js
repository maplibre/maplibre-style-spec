import React from 'react';
import createFormatters from 'documentation/src/output/util/formatters';
import LinkerStack from 'documentation/src/output/util/linker_stack';

import docs from '../components/api.json';

const { linker } = require('./linker');

const linkerStack = new LinkerStack({}).namespaceResolver(docs, (namespace) => {
    return linker(namespace);
});

export const formatters = createFormatters(linkerStack.link);

// convert ast to html
export function toHtml(ast, inline) {
    if (
        inline &&
        ast &&
        ast.children.length &&
        ast.children[0].type === 'paragraph'
    ) {
        ast = {
            type: 'root',
            children: ast.children[0].children.concat(ast.children.slice(1))
        };
    }
    return (
        <span
            dangerouslySetInnerHTML={{
                __html: `${formatters.markdown(ast)}`
            }}
        />
    );
}

// format api type into html
export function formatType(type) {
    return (
        <span
            dangerouslySetInnerHTML={{ __html: `${formatters.type(type)}` }}
        />
    );
}

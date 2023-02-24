import React from 'react';
import { highlightJsx } from '@mapbox/dr-ui/highlight/jsx';
import { highlightJson } from '@mapbox/dr-ui/highlight/json';
import { highlightHtml } from '@mapbox/dr-ui/highlight/html';

function wrapper(language, code, highlighter) {
    const startingIndent = code.match(/^\n( *)/);
    const dedentSize = startingIndent ? startingIndent[1].length : 0;
    if (dedentSize) {
        code = code.replace(new RegExp(`^ {0,${dedentSize}}`, 'mg'), '');
    }
    const highlightedCode = highlighter()(code.trim());
    return (
        <pre className={`language-${language}`}>
            <code
                className={`language-${language}`}
                dangerouslySetInnerHTML={{ __html: `${highlightedCode}` }}
            />
        </pre>
    );
}

export function highlightMarkup(code) {
    return wrapper('html', code, () => highlightHtml);
}

export function highlightJavascript(code) {
    return wrapper('javascript', code, () => highlightJsx);
}

export function highlightJSON(code) {
    return wrapper('json', code, () => highlightJson);
}

export function highlightShell(code) {
    return (
        <pre className={`language-shell`}>
            <code className={`language-shell`} />
            {code}
        </pre>
    );
}

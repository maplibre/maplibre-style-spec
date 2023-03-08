import React from 'react';
import {render} from 'react-dom';
import Highlight, {defaultProps} from 'prism-react-renderer';

export function highlightMarkup(code) {
    return <Highlight {...defaultProps} code={code} language="html">
        {({className, style, tokens, getLineProps, getTokenProps}) => (
            <pre className={className} style={style}>
                {tokens.map((line, i) => (
                    <div {...getLineProps({line, key: i})}>
                        {line.map((token, key) => (
                            <span {...getTokenProps({token, key})} />
                        ))}
                    </div>
                ))}
            </pre>
        )}
    </Highlight>;
}

export function highlightJavascript(code) {

    return <Highlight {...defaultProps} code={code} language="javascript">
        {({className, style, tokens, getLineProps, getTokenProps}) => (
            <pre className={className} style={style}>
                {tokens.map((line, i) => (
                    <div {...getLineProps({line, key: i})}>
                        {line.map((token, key) => (
                            <span {...getTokenProps({token, key})} />
                        ))}
                    </div>
                ))}
            </pre>
        )}
    </Highlight>;
}

export function highlightJSON(code) {
    return <Highlight {...defaultProps} code={code} language="json">
        {({className, style, tokens, getLineProps, getTokenProps}) => (
            <pre className={className} style={style}>
                {tokens.map((line, i) => (
                    <div {...getLineProps({line, key: i})}>
                        {line.map((token, key) => (
                            <span {...getTokenProps({token, key})} />
                        ))}
                    </div>
                ))}
            </pre>
        )}
    </Highlight>;
}

export function highlightShell(code) {
    return (
        <Highlight {...defaultProps} code={code} language={'bash'}>
            {({className, style, tokens, getLineProps, getTokenProps}) => (
                <pre className={className} style={style}>
                    {tokens.map((line, i) => (
                        <div {...getLineProps({line, key: i})}>
                            {line.map((token, key) => (
                                <span {...getTokenProps({token, key})} />
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>

    );
}

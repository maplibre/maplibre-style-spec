import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

import ref from '../../../reference/latest';


function Sprint1Prism() {

    const ex = JSON.stringify(
        ref.$root.sprite.example,
        null,
        2
    )
    const mdString = `"sprite": {${ex}}`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default Sprint1Prism;

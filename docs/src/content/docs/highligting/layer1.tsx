import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

import ref from '../../../reference/latest';


function Layers1Prism() {

    const ex = JSON.stringify(
        ref.$root.layers.example,
        null,
        2
    )
    const mdString = `"layers": {${ex}}`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default Layers1Prism;

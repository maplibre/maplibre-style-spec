import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

import ref from '../../../reference/latest';


function Glyphs1Prism() {

    const ex = JSON.stringify(
        ref.$root.glyphs.example,
        null,
        2
    )
    const mdString = `"glyphs": {${ex}}`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default Glyphs1Prism;

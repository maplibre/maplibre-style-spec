import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

import ref from '../../../reference/latest';


function Transition1Prism() {

    const ex = JSON.stringify(
        ref.$root.transition.example,
        null,
        2
    )
    const mdString = `"transition": {${ex}}`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default Transition1Prism;

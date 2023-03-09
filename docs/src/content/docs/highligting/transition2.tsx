import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

import ref from '../../../reference/latest';


function Transition2Prism() {

    const ex = JSON.stringify(
        ref.$root.transition.example,
        null,
        2
    )
    const mdString = `"fill-opacity-transition": {${ex}}`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default Transition2Prism;

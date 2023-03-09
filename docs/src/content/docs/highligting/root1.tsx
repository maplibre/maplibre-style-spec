import React from 'react';
import {highlightJSON} from '../../../components/style-spec/prism_highlight';

function RootPrism() {

    const version = 10;

    const mdString = `{
    "version": ${version},
    "name": "Mapbox Streets",
    "sprite": "mapbox://sprites/mapbox/streets-v${version}",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    "sources": {...},
    "layers": [...]
  }`;

    const highligted = highlightJSON(mdString);

    return (
        <>
            <p>{highligted}</p>
        </>
    );
}

export default RootPrism;

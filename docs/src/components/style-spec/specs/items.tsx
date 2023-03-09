import React from 'react';
import entries from 'object.entries';
import Item from './item.jsx';


interface Items {
    entry: object;
    section: string;
    kind: string;
    headingLevel?: '2' | '3';
}

export default class Items extends React.Component {
    render() {
     
        return (
            <React.Fragment>
                {entries(this.props.entry)
                    .sort()
                    .map(([name, prop], i) => {
                        const entry = this.props.entry[name];
                        const section = entry.section || this.props.section;
                        const kind = entry.kind || this.props.kind;
                        const headingLevel =
                            entry.headingLevel || this.props.headingLevel;
                        // if section begins with the name of a source type, do not display an item for * or type
                        if (
                            [
                                'vector',
                                'raster',
                                'raster-dem',
                                'geojson',
                                'image',
                                'video'
                            ].indexOf(this.props.section) > -1 &&
                            (name === '*' || name === 'type')
                        )
                            return;

                        return (
                            <Item
                                key={i}
                                id={`${section ? `${section}-` : ''}${name}`}
                                name={name}
                                {...prop}
                                kind={kind}
                                headingLevel={headingLevel}
                            />
                        );
                    })}
            </React.Fragment>
        );
    }
}


import entries from 'object.entries';
import Item from './item.jsx';

interface IItems {
    entry: object;
    section?: string;
    kind?: string;
    headingLevel?: '2' | '3';
}

export function Items (props:IItems) {

    return (
        <>
            {entries(props.entry)
                .sort()
                .map(([name, prop]:any, i:number) => {
                    const entry = props.entry[name];
                    const section = entry.section || props.section;
                    const kind = entry.kind || props.kind;
                    const headingLevel =
                            entry.headingLevel || props.headingLevel;
                        // if section begins with the name of a source type, do not display an item for * or type
                    if (
                        [
                            'vector',
                            'raster',
                            'raster-dem',
                            'geojson',
                            'image',
                            'video'
                        ].indexOf(props.section) > -1 &&
                            (name === '*' || name === 'type')
                    ) return <></>;

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
        </>
    );

}

export default Items;

import Item from './item.jsx';
import {For} from 'solid-js';

export function Items (props:{
    entry: object;
    section?: string;
    kind?: string;
    headingLevel?: '2' | '3';
}) {

    return (
        <For each={Object.entries(props.entry)
            .sort()}>
            {([name, prop]:any) => {
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
                        id={`${section ? `${section}-` : ''}${name}`}
                        name={name}
                        {...prop}
                        kind={kind}
                        headingLevel={headingLevel}
                    />
                );
            }}

        </For>
    );

}

export default Items;

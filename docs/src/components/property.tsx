import {JSXElement} from 'solid-js';
import {Dynamic} from 'solid-js/web';

export default function Property ({headingLevel = '3', id, children}:{
    id: string;
    children?: JSXElement;
    headingLevel?: '2' | '3';
}) {

    const Heading = `h${headingLevel}`;

    return (
        <Dynamic component={Heading} id={id} class="unprose txt-mono anchor txt-l mb3 mt24">
            <a
                class="style-spec-property unprose cursor-pointer color-blue-on-hover block"
                href={`#${id}`}
            >
                {children}
            </a>
        </Dynamic>
    );

}

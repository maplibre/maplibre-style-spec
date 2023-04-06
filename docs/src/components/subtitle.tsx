import {JSXElement} from 'solid-js';

export default function Subtitle (props: { children?: JSXElement }) {

    return (
        <div class="mb12 color-gray txt-em">{props.children}</div>
    );

}

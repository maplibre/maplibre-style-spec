import {JSXElement} from 'solid-js';

const Caption = (props:{children?: JSXElement; theme?: string}) => {

    return (
        <div
            class="txt-em py12 px18 bg-gray-faint"
            style={{color: '#546C8C'}}
        >
            {props.children}
        </div>
    );

};

export default Caption;

const Caption = (props:any) => {

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

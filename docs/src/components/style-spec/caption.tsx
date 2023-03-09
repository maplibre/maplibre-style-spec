import React from 'react';

export default class Caption extends React.Component {
    render() {
        return (
            <div
                className="txt-em py12 px18 bg-gray-faint"
                style={{color: '#546C8C'}}
            >
                {this.props.children}
            </div>
        );
    }
}
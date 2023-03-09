import React from 'react';

export default class Subtitle extends React.Component {
    render() {
        return (
            <div className="mb12 color-gray txt-em">{this.props.children}</div>
        );
    }
}

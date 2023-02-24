import React from 'react';
import PropTypes from 'prop-types';

export default class Subtitle extends React.Component {
    render() {
        return (
            <div className="mb12 color-gray txt-em">{this.props.children}</div>
        );
    }
}

Subtitle.propTypes = {
    children: PropTypes.node
};

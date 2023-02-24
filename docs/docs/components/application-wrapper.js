import React from 'react';
import PropTypes from 'prop-types';

if (typeof window !== 'undefined') {
    import(
        /* webpackChunkName: "assembly-js" */ '@mapbox/mbx-assembly/dist/assembly.js'
    );
}

class ApplicationWrapper extends React.Component {
    render() {
        return this.props.children;
    }
}

ApplicationWrapper.propTypes = {
    children: PropTypes.node
};

export default ApplicationWrapper;

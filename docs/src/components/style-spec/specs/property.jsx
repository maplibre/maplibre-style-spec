import React from 'react';
import PropTypes from 'prop-types';

export default class Property extends React.Component {
    render() {
        const { headingLevel, id, children } = this.props;
        const Heading = `h${headingLevel}`;
        return (
            <Heading id={id} className="unprose txt-mono anchor txt-l mb3 mt24">
                <a
                    className="style-spec-property unprose cursor-pointer color-blue-on-hover block"
                    href={`#${id}`}
                >
                    {children}
                </a>
            </Heading>
        );
    }
}

Property.defaultProps = {
    headingLevel: '2'
};

Property.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    headingLevel: PropTypes.oneOf(['2', '3'])
};

import React from 'react';
import PropTypes from 'prop-types';
import Title from './title';

export default class SectionWrapper extends React.Component {
    render() {
        const {
            children,
            headingLevel,
            section,
            title,
            titleComponent
        } = this.props;
        return (
            <React.Fragment>
                {title && (
                    <Title headingLevel={headingLevel} section={section}>
                        {title}
                    </Title>
                )}
                {titleComponent ? titleComponent : ''}
                {children}
            </React.Fragment>
        );
    }
}

SectionWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    titleComponent: PropTypes.node,
    section: PropTypes.object,
    headingLevel: PropTypes.number
};

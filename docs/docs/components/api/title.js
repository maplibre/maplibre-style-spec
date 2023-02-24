import React from 'react';
import PropTypes from 'prop-types';
import slug from 'slugg';

export default class Title extends React.Component {
    render() {
        const { children, section, headingLevel } = this.props;
        const pageName =
            section && section.name === 'Map class' ? 'Map' : section.name;
        const id = slug(`${pageName || ''} ${children}`);
        const HeadingLevel = `h${headingLevel}`;

        return (
            <HeadingLevel id={id} className="unprose txt-m mt24 mb3 anchor">
                <a
                    className="unprose block color-blue-on-hover txt-bold"
                    href={`#${id}`}
                >
                    {children}
                </a>
            </HeadingLevel>
        );
    }
}

Title.propTypes = {
    children: PropTypes.node.isRequired,
    section: PropTypes.shape({
        name: PropTypes.string
    }),
    headingLevel: PropTypes.number
};

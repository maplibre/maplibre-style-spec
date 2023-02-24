import React from 'react';
import PropTypes from 'prop-types';
import Github from './github';

export default class SectionHeading extends React.Component {
    render() {
        const { section, headingLevel } = this.props;
        const HeadingLevel = `h${headingLevel}`;
        return (
            <React.Fragment>
                <HeadingLevel
                    className="mt36 mb18 txt-xl unprose anchor"
                    id={section.namespace.toLowerCase()}
                >
                    <a
                        className="unprose color-blue-on-hover"
                        href={`#${section.namespace.toLowerCase()}`}
                    >
                        {section.name}
                    </a>
                </HeadingLevel>
                <Github section={section} />
            </React.Fragment>
        );
    }
}

SectionHeading.propTypes = {
    headingLevel: PropTypes.number,
    section: PropTypes.shape({
        namespace: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        context: PropTypes.shape({
            github: PropTypes.shape({
                url: PropTypes.string.isRequired,
                path: PropTypes.string.isRequired
            })
        })
    }).isRequired
};

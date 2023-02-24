import React from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './section-wrapper';
import { toHtml } from '../../util/formatters';

export default class Related extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <SectionWrapper title="Related" {...this.props}>
                <ul>
                    {section.sees.map((see, i) => (
                        <li key={i}>{toHtml(see.description, true)}</li>
                    ))}
                </ul>
            </SectionWrapper>
        );
    }
}

Related.propTypes = {
    section: PropTypes.shape({
        sees: PropTypes.array.isRequired
    }).isRequired
};

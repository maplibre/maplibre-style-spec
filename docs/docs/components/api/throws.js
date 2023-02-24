import React from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './section-wrapper';
import { toHtml, formatType } from '../../util/formatters';

export default class Throws extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <SectionWrapper title="Throws" {...this.props}>
                <ul>
                    {section.throws.map((throws, i) => (
                        <li key={i}>
                            {formatType(throws.type)}:{' '}
                            {toHtml(throws.description, true)}
                        </li>
                    ))}
                </ul>
            </SectionWrapper>
        );
    }
}

Throws.propTypes = {
    section: PropTypes.shape({
        throws: PropTypes.array
    }).isRequired
};

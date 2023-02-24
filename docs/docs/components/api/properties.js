import React from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './section-wrapper';
import { toHtml, formatType } from '../../util/formatters';

export default class Properties extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <SectionWrapper title="Properties" {...this.props}>
                {section.properties.map((property, i) => (
                    <div key={i} className="mb6">
                        <span className="txt-mono txt-bold mr6">
                            {property.name}
                        </span>
                        <code className="color-gray">
                            ({formatType(property.type)})
                        </code>
                        {property.default && (
                            <span>
                                {'('}
                                default <code>{property.default}</code>
                                {')'}
                            </span>
                        )}
                        {property.description && (
                            <span>: {toHtml(property.description, true)}</span>
                        )}
                        {property.properties && (
                            <ul>
                                {property.properties.map((property, i) => (
                                    <li key={i}>
                                        <code>{property.name}</code>{' '}
                                        {formatType(property.type)}
                                        {property.default && (
                                            <span>
                                                {'('}
                                                default{' '}
                                                <code>{property.default}</code>
                                                {')'}
                                            </span>
                                        )}
                                        {toHtml(property.description)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </SectionWrapper>
        );
    }
}

Properties.propTypes = {
    section: PropTypes.shape({
        properties: PropTypes.array.isRequired
    }).isRequired
};

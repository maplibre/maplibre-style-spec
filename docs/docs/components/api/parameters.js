import React from 'react';
import PropTypes from 'prop-types';
import SectionWrapper from './section-wrapper';
import { toHtml, formatType } from '../../util/formatters';

export default class Parameters extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <SectionWrapper title="Parameters" {...this.props}>
                {section.params.map((param, i) => (
                    <div key={i} className="mb6">
                        <React.Fragment>
                            <span className="txt-mono txt-bold">
                                {param.name}
                            </span>
                            <code className="color-gray">
                                ({formatType(param.type)})
                            </code>
                            {param.default && (
                                <span>
                                    {'('}
                                    default <code>{param.default}</code>
                                    {')'}
                                </span>
                            )}
                            {toHtml(param.description, true)}
                        </React.Fragment>
                        {param.properties && (
                            <div className="mt6 mb12 scroll-auto">
                                <table className="table table--fixed table--compact">
                                    <colgroup>
                                        <col width="30%" />
                                        <col width="70%" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-gray-faint">
                                            <th
                                                style={{
                                                    borderTopLeftRadius: '4px'
                                                }}
                                            >
                                                Name
                                            </th>
                                            <th
                                                style={{
                                                    borderTopRightRadius: '4px'
                                                }}
                                            >
                                                Description
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {param.properties.map((property, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="txt-mono txt-bold txt-break-word">
                                                        {property.name}
                                                    </div>

                                                    <code className="inline-block color-gray txt-break-word">
                                                        {formatType(
                                                            property.type
                                                        )}
                                                    </code>

                                                    {property.default && (
                                                        <div className="color-gray txt-break-word">
                                                            default:{' '}
                                                            <code>
                                                                {
                                                                    property.default
                                                                }
                                                            </code>
                                                        </div>
                                                    )}
                                                </td>
                                                <td
                                                    style={{
                                                        wordBreak: 'break-word'
                                                    }}
                                                >
                                                    {toHtml(
                                                        property.description,
                                                        true
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </SectionWrapper>
        );
    }
}

Parameters.propTypes = {
    section: PropTypes.shape({
        params: PropTypes.array.isRequired
    }).isRequired
};

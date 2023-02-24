import React from 'react';
import PropTypes from 'prop-types';
import { groupedExpressions } from '../../data/types';
import SDKSupportTable from '../sdk_support_table';
import md from '../md';
import { highlightJavascript } from '../prism_highlight';
import { renderSignature } from './render-signature';
import Property from './property.js';
import related from '../../data/expressions-related.json';

export default class ExpressionReference extends React.Component {
    render() {
        const group = groupedExpressions.filter(
            (g) => g.name === this.props.group
        )[0];

        const SubHeading = ({ children }) => (
            <h3
                style={{ fontSize: '15px', lineHeight: '24px' }}
                className="txt-bold mb6 unprose pt0"
            >
                {children}
            </h3>
        );

        const Related = ({ links }) => {
            if (!links || !links.length === 0) return;
            return (
                <React.Fragment>
                    <SubHeading>Related</SubHeading>
                    <ul className="mb18">
                        {links.map((link) => (
                            <li key={link.title}>
                                <a href={link.href}>{link.title}</a>
                            </li>
                        ))}
                    </ul>
                </React.Fragment>
            );
        };
        return group.expressions.map(({ name, doc, type, sdkSupport }) => (
            <React.Fragment key={name}>
                {/* Section heading */}
                <Property
                    id={`${group.name === 'Types' ? 'types-' : ''}${name}`}
                >
                    {name}
                </Property>
                {/* Description */}
                {doc && <div className="mb12">{md(doc)}</div>}
                {/* Syntax */}
                <SubHeading>Syntax</SubHeading>
                {type.map((overload, i) => (
                    <div key={i}>
                        {highlightJavascript(renderSignature(name, overload))}
                    </div>
                ))}
                {/* Show related links if available */}
                {related[name] && <Related links={related[name]} />}
                {/* Show SDK support table if available */}
                {sdkSupport && <SDKSupportTable {...sdkSupport} />}
            </React.Fragment>
        ));
    }
}

ExpressionReference.propTypes = {
    group: PropTypes.string.isRequired
};

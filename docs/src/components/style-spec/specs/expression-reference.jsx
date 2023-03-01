import React from 'react';
import PropTypes from 'prop-types';
import { groupedExpressions } from '../../data/types.jsx';
import SDKSupportTable from '../sdk_support_table.jsx'; 
import md from '../md.jsx';
import { highlightJavascript } from '../prism_highlight.jsx';
import { renderSignature } from './render-signature';
import Property from './property.jsx';
import related from '../../data/expressions-related.json';
import ReactMarkdown from 'react-markdown'

export default class ExpressionReference extends React.Component {
    render() {
        const group = groupedExpressions.filter(
            (g) => g.name === this.props.group
        )[0];
            debugger
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
                {doc && <ReactMarkdown className="mb12">{doc}</ReactMarkdown>}
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
                
                {sdkSupport && <SDKSupportTable supportItems={sdkSupport} /> }
            </React.Fragment>
        ));
    }
}

ExpressionReference.propTypes = {
    group: PropTypes.string.isRequired
};
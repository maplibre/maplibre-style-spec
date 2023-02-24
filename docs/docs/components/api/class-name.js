import React from 'react';
import PropTypes from 'prop-types';
import { formatters } from '../../util/formatters';

export default class ClassName extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <div
                className="txt-code my18 py12 px12 txt-s"
                dangerouslySetInnerHTML={{
                    __html: `<span class="token keyword">new</span> <span class="token class-name">${
                        section.name
                    }</span>${formatters.parameters(section)}`
                }}
            />
        );
    }
}

ClassName.propTypes = {
    section: PropTypes.shape({
        name: PropTypes.string.isRequired
    }).isRequired
};

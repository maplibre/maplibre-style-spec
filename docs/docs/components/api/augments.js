import React from 'react';
import PropTypes from 'prop-types';
import { formatters } from '../../util/formatters';

export default class Augments extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <div className="mt12">
                Extends{' '}
                {section.augments.map((tag, i) => (
                    <span
                        key={i}
                        dangerouslySetInnerHTML={{
                            __html: `${formatters.autolink(tag.name)}`
                        }}
                    />
                ))}
                .
            </div>
        );
    }
}

Augments.propTypes = {
    section: PropTypes.shape({
        augments: PropTypes.array.isRequired
    }).isRequired
};

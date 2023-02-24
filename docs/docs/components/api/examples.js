import React from 'react';
import PropTypes from 'prop-types';
import Copyable from '../../components/copyable.js';
import SectionWrapper from './section-wrapper';
import { toHtml } from '../../util/formatters';

export default class Examples extends React.Component {
    render() {
        const { section } = this.props;
        return (
            <SectionWrapper title="Example" {...this.props}>
                {section.examples.map((example, i) => (
                    <div key={i} className="mb12 api-example">
                        {example.caption && <p>{toHtml(example.caption)}</p>}
                        <Copyable lang="javascript">
                            {example.description}
                        </Copyable>
                    </div>
                ))}
            </SectionWrapper>
        );
    }
}

Examples.propTypes = {
    section: PropTypes.shape({
        examples: PropTypes.arrayOf(
            PropTypes.shape({
                caption: PropTypes.string,
                description: PropTypes.string.isRequired
            })
        ).isRequired
    }).isRequired
};

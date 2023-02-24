import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from './section-heading';
import ApiItemContents from './item-contents';
import SectionWrapper from './section-wrapper';

class ApiItem extends React.Component {
    render() {
        const section = this.props;
        return (
            <SectionWrapper
                headingLevel={section.headingLevel}
                titleComponent={
                    !section.nested && (
                        <SectionHeading
                            headingLevel={section.headingLevel}
                            section={section}
                        />
                    )
                }
            >
                <ApiItemContents
                    {...this.props}
                    headingLevel={section.headingLevel + 1} // increment heading level to maintain hierarchy on subordinate items
                />
            </SectionWrapper>
        );
    }
}

ApiItem.propTypes = {
    nested: PropTypes.bool,
    headingLevel: PropTypes.number.isRequired
};

export default ApiItem;

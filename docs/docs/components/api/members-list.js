import React from 'react';
import PropTypes from 'prop-types';
import ApiItemMember from './item-member';
import SectionWrapper from './section-wrapper';
import ControlText from '@mapbox/mr-ui/control-text';
import { searchMembers } from '../../util/search-members';
import slug from 'slugg';

export default class MembersList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filter: '', closeAll: false };
    }

    // close all item members so it's easier to read them
    filterMembers = (value) => {
        this.setState({ filter: value, closeAll: true }, () => {
            this.setState({ closeAll: false });
        });
        this.clearHash();
    };

    // clear hash from window location
    clearHash = () => {
        if (history.pushState && window) {
            history.pushState(null, null, window.location.pathname);
        }
    };

    render() {
        const { title, members } = this.props;
        const { filter } = this.state;
        const filteredMembers = filter
            ? searchMembers(members, filter)
            : members;

        return (
            <SectionWrapper title={title} {...this.props}>
                {members.length > 9 && (
                    <div className="relative">
                        <div className="absolute flex-parent flex-parent--center-cross flex-parent--center-main w36 h36 color-gray">
                            <svg className="icon">
                                <use xlinkHref="#icon-search"></use>
                            </svg>
                        </div>
                        <ControlText
                            themeControlInput="input pl36"
                            id={`filter-${slug(this.props.section.name)}-${slug(
                                title
                            )}`}
                            themeLabel="hide-visually"
                            label={`Search ${title}`}
                            placeholder={`Search ${title}`}
                            onChange={this.filterMembers}
                            value={filter}
                        />
                    </div>
                )}
                {filter && (
                    <div className="txt-s color-gray mt3">
                        Found {filteredMembers.length} {title} for{' '}
                        <code>{filter}</code>
                        <button
                            className="btn btn--stroke btn--s btn--gray ml6"
                            onClick={() => this.filterMembers('')}
                        >
                            Clear filter
                        </button>
                    </div>
                )}

                {filteredMembers.map((member, i) => (
                    <ApiItemMember
                        closeAll={this.state.closeAll}
                        {...this.props}
                        key={i}
                        {...member}
                        headingLevel={this.props.headingLevel + 1} // increase heading level
                    />
                ))}
            </SectionWrapper>
        );
    }
}

MembersList.propTypes = {
    title: PropTypes.string.isRequired,
    members: PropTypes.array.isRequired,
    section: PropTypes.object.isRequired,
    headingLevel: PropTypes.number
};

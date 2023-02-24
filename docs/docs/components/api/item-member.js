import React from 'react';
import PropTypes from 'prop-types';
import { formatters } from '../../util/formatters';
import ApiItem from './item';
import Icon from '@mapbox/mr-ui/icon';
import classnames from 'classnames';

class ApiItemMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = { disclosed: false };
        this.hashChange = this.hashChange.bind(this);
    }

    href = (m) => `#${m.namespace.toLowerCase()}`;

    render() {
        const member = this.props;

        const HeadingLevel = `h${this.props.headingLevel}`;
        return (
            <div
                className="scroll-margin-top my6 border border--gray-light bg-gray-faint round"
                id={member.namespace.toLowerCase()}
                aria-expanded={this.state.disclosed}
            >
                <React.Fragment>
                    <button
                        className={classnames(
                            'cursor-pointer w-full color-blue-on-hover px12 py6',
                            {
                                'txt-bold': this.state.disclosed
                            }
                        )}
                        onClick={(e) => {
                            this.setState({ disclosed: !this.state.disclosed });
                            if (history.pushState) {
                                history.pushState(
                                    null,
                                    null,
                                    this.href(member)
                                );
                            } else {
                                location.hash = this.href(member);
                            }

                            e.preventDefault();
                        }}
                    >
                        <HeadingLevel
                            style={{
                                fontSize: '13px',
                                lineHeight: '24px',
                                fontWeight: 'inherit'
                            }}
                            className="txt-mono truncate mb0 pt0 inline-block"
                        >
                            {member.name}
                        </HeadingLevel>
                        {member.kind === 'function' && (
                            <span
                                className="txt-mono"
                                style={{
                                    color: '#54718f' /* a11y color-gray */
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: `${formatters.parameters(
                                        member,
                                        true
                                    )}`
                                }}
                            />
                        )}
                        <div className="fr">
                            <Icon
                                size={30}
                                name={
                                    this.state.disclosed
                                        ? 'caret-down'
                                        : 'caret-right'
                                }
                                inline={true}
                            />
                        </div>
                    </button>
                </React.Fragment>

                {this.state.disclosed && (
                    <div className="pt12 pb18 px12 border-t border--gray-light round-b item-member bg-white">
                        <ApiItem
                            nested={true}
                            location={this.props.location}
                            {...member}
                        />
                    </div>
                )}
            </div>
        );
    }

    hashChange() {
        if (window.location.hash === this.href(this.props)) {
            this.setState({ disclosed: true });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.closeAll !== this.props.closeAll) {
            if (this.props.closeAll && this.state.disclosed) {
                this.setState({ disclosed: false });
            }
        }
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChange);
        this.hashChange();
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashChange);
    }
}

ApiItemMember.propTypes = {
    namespace: PropTypes.string,
    name: PropTypes.string,
    kind: PropTypes.string,
    location: PropTypes.object,
    closeAll: PropTypes.bool,
    headingLevel: PropTypes.number
};

export default ApiItemMember;

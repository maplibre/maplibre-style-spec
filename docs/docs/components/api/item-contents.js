import React from 'react';
import PropTypes from 'prop-types';
import MembersList from './members-list';
import Augments from './augments';
import ClassName from './class-name';
import Parameters from './parameters';
import Properties from './properties';
import Returns from './returns';
import Throws from './throws';
import Examples from './examples';
import Related from './related';
import { toHtml } from '../../util/formatters';
import empty from '../../util/empty';

class ApiItemContents extends React.Component {
    render() {
        const section = this.props;
        const membersList = (members, title) =>
            !empty(members) && (
                <MembersList
                    headingLevel={this.props.headingLevel}
                    section={section}
                    title={title}
                    members={members}
                />
            );

        return (
            <React.Fragment>
                {toHtml(section.description)}

                {!empty(section.augments) && (
                    <Augments
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}

                {section.kind === 'class' &&
                    !section.interface &&
                    (!section.constructorComment ||
                        section.constructorComment.access !== 'private') && (
                        <ClassName
                            headingLevel={this.props.headingLevel}
                            section={section}
                        />
                    )}

                {!empty(section.params) &&
                    (section.kind !== 'class' ||
                        !section.constructorComment ||
                        section.constructorComment.access !== 'private') && (
                        <Parameters
                            headingLevel={this.props.headingLevel}
                            section={section}
                        />
                    )}

                {!empty(section.properties) && (
                    <Properties
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}

                {section.returns && (
                    <Returns
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}

                {!empty(section.throws) && (
                    <Throws
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}

                {!empty(section.examples) && (
                    <Examples
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}

                {membersList(section.members.static, 'Static Members')}
                {membersList(section.members.instance, 'Instance Members')}
                {membersList(section.members.events, 'Events')}

                {!empty(section.sees) && (
                    <Related
                        headingLevel={this.props.headingLevel}
                        section={section}
                    />
                )}
            </React.Fragment>
        );
    }
}

ApiItemContents.propTypes = {
    augments: PropTypes.array,
    kind: PropTypes.string,
    constructorComment: PropTypes.shape({
        access: PropTypes.string
    }),
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    interface: PropTypes.string,
    params: PropTypes.array,
    properties: PropTypes.array,
    returns: PropTypes.array,
    throws: PropTypes.array,
    examples: PropTypes.array,
    members: PropTypes.object,
    sees: PropTypes.array,
    headingLevel: PropTypes.number
};

export default ApiItemContents;

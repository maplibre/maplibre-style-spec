import React from 'react';
import PropTypes from 'prop-types';
import PageShell from '../page-shell';
import ApiPageItems from './api-page-items.js';

export default class Api extends React.Component {
    render() {
        this.props.frontMatter.hideFeedback = true;
        return (
            <PageShell {...this.props}>
                <div className="prose mb18">
                    <ApiPageItems
                        name={this.props.name || this.props.frontMatter.title}
                        location={this.props.location}
                    />
                </div>
            </PageShell>
        );
    }
}

Api.propTypes = {
    frontMatter: PropTypes.shape({
        title: PropTypes.string.isRequired,
        hideFeedback: PropTypes.bool
    }).isRequired,
    location: PropTypes.object.isRequired,
    name: PropTypes.string // when the documentation.yml `name` doesn't match the page's title, use this prop to define the documentation.yml `name`
};

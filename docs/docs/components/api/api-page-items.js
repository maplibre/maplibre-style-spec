import React from 'react';
import PropTypes from 'prop-types';
import ApiItem from './item';
import ApiItemContents from './item-contents';
import Github from './github';
import { toHtml } from '../../util/formatters';

const apiFilterItems = require('../../util/api-filter-items.js');

export default class ApiPageItems extends React.Component {
    pageDocSource = apiFilterItems(this.props.name);
    children = this.pageDocSource[0].members.static;
    renderDescription = () => {
        const description = this.pageDocSource[0].description || false;
        if (description) return toHtml(description);
    };
    renderItems = () => {
        // There are 2 layouts based on the content:
        // 1. `SingleSection` (for Maps page)
        // 2. `Section` (for all other pages)

        if (this.children.length === 1) {
            return <SingleSection {...this.children[0]} {...this.props} />;
        }
        return this.children.map((child) => (
            <Section key={child.name} {...this.props} {...child} />
        ));
    };

    render() {
        return (
            <React.Fragment>
                {this.renderDescription()}
                {this.renderItems()}
            </React.Fragment>
        );
    }
}

ApiPageItems.propTypes = {
    name: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired
};

class Section extends React.Component {
    render() {
        const child = this.props;
        return (
            <React.Fragment>
                <div className="mb18">
                    <ApiItem headingLevel={2} {...child} />
                </div>
            </React.Fragment>
        );
    }
}

Section.propTypes = {
    name: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired
};

class SingleSection extends React.Component {
    render() {
        const child = this.props;
        return (
            <React.Fragment>
                <div className="mt30-mm mt-neg30-mxl">
                    <Github section={child} />
                </div>
                <div className="mb18">
                    <ApiItemContents {...child} headingLevel={2} />
                </div>
            </React.Fragment>
        );
    }
}
SingleSection.propTypes = {
    location: PropTypes.object.isRequired
};

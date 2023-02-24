import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import Fuse from 'fuse.js';
import apiSearch from '@mapbox/batfish/data/api-search'; // eslint-disable-line
import classnames from 'classnames';
import { routeTo } from '@mapbox/batfish/modules/route-to';

export default class ApiSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = { filter: '', results: [] };
    }

    // set filter as user types
    handleQuery = (value) => {
        this.setState({ filter: value }, () => {
            this.handleSearch();
        });
    };

    // perform search and return results
    handleSearch = () => {
        const fuse = new Fuse(apiSearch, {
            keys: ['name', 'description', 'namespace'], // keys to perform search on
            threshold: 0.3 // slightly stricter
        });
        this.setState({
            results: fuse.search(this.state.filter)
                ? fuse.search(this.state.filter).map((result) => result.item)
                : []
        });
    };

    // perform these functions when the users selects a menu item
    handleResultClick = (selection) => {
        // open selection in current window
        routeTo(selection.path);
        // clear search
        this.setState({ filter: '' });
    };

    render() {
        const { results, filter } = this.state;
        return (
            <Downshift
                id="api-reference-search"
                inputValue={filter}
                onChange={(selection) => this.handleResultClick(selection)}
                onInputValueChange={this.handleQuery}
                itemToString={() => filter}
            >
                {(downshiftProps) => {
                    const {
                        getInputProps,
                        isOpen,
                        getItemProps,
                        openMenu,
                        getLabelProps
                    } = downshiftProps;

                    return (
                        <div className="none block-mm my12">
                            <div className="relative">
                                <Input
                                    getInputProps={getInputProps}
                                    openMenu={openMenu}
                                    getLabelProps={getLabelProps}
                                />
                                {isOpen && filter && (
                                    <Results
                                        results={results}
                                        getItemProps={getItemProps}
                                        downshiftProps={downshiftProps}
                                    />
                                )}
                            </div>
                        </div>
                    );
                }}
            </Downshift>
        );
    }
}

class Input extends React.Component {
    render() {
        const { getLabelProps, getInputProps, openMenu } = this.props;
        return (
            <React.Fragment>
                <label className="hide-visually" {...getLabelProps()}>
                    Search API Reference
                </label>
                <input
                    placeholder="Search API Reference"
                    className="input bg-white"
                    {...getInputProps({
                        onFocus: () => openMenu()
                    })}
                />
            </React.Fragment>
        );
    }
}

Input.propTypes = {
    getLabelProps: PropTypes.func.isRequired,
    getInputProps: PropTypes.func.isRequired,
    openMenu: PropTypes.func.isRequired
};

class Results extends React.Component {
    render() {
        const { results, getItemProps, downshiftProps } = this.props;
        return (
            <div className="shadow-darken25 round mt3 bg-white scroll-auto scroll-styled hmax180 absolute z4 w-full align-l py6">
                {results.length > 0 ? (
                    results.map((result, index) => (
                        <Result
                            getItemProps={getItemProps}
                            index={index}
                            result={result}
                            key={index}
                            downshiftProps={downshiftProps}
                        />
                    ))
                ) : (
                    <div className="px12 py3">No results</div>
                )}
            </div>
        );
    }
}
Results.propTypes = {
    getItemProps: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired,
    downshiftProps: PropTypes.shape({
        highlightedIndex: PropTypes.number
    })
};

class Result extends React.Component {
    render() {
        return (
            <div
                {...this.props.getItemProps({
                    key: this.props.index,
                    item: this.props.result,
                    className: classnames(
                        'py6 px12 txt-s link--gray-dark cursor-pointer txt-break-word',
                        {
                            'bg-gray-faint':
                                this.props.downshiftProps.highlightedIndex ===
                                this.props.index
                        }
                    )
                })}
            >
                {this.props.result.namespace}
            </div>
        );
    }
}

Result.propTypes = {
    getItemProps: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    result: PropTypes.object.isRequired,
    downshiftProps: PropTypes.shape({
        highlightedIndex: PropTypes.number
    })
};

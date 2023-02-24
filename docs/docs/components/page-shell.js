import React from 'react';
import PropTypes from 'prop-types';
// docs-page-shell
import ReactPageShell from '../../vendor/docs-page-shell/react-page-shell.js';
// dr-ui components
import PageLayout from '@mapbox/dr-ui/page-layout';
import { buildMeta, findParentPath } from '@mapbox/dr-ui/page-layout/utils';
// site variables
import constants from '../constants';
// batfish modules
import { withLocation } from '@mapbox/batfish/modules/with-location';
// dataSelectors
import navigation from '@mapbox/batfish/data/navigation';
import filters from '@mapbox/batfish/data/filters';

import { styleSpecNavigation } from '../data/style-spec-navigation';

import AppropriateImage from './appropriate-image';
import Browser from '@mapbox/dr-ui/browser';
import classnames from 'classnames';
import { version as styleSpecVersion } from '../../../package.json';

const redirectStyleSpec = require('../util/style-spec-redirect');

class PageShell extends React.Component {
    componentDidMount() {
        // redirect hashes on /style-spec/
        if (
            this.props.location.pathname ===
                '/maplibre-gl/style-spec/' &&
            this.props.location.hash
        ) {
            if (redirectStyleSpec(this.props.location))
                window.location = redirectStyleSpec(this.props.location);
        }
    }
    renderCustomHeadings = () => {
        const { location, frontMatter } = this.props;

        const subSection = findParentPath(navigation, location.pathname);
        
        if (subSection === '/maplibre-gl/style-spec/') {
            return (
                styleSpecNavigation.filter(
                    (f) => f.path === location.pathname
                )[0].subnav || frontMatter.headings
            );
        }  else {
            return frontMatter.headings;
        }
    };
    renderCustomAside = () => {
        return undefined;
    };
    render() {
        const { location, children, frontMatter } = this.props;
        const meta = buildMeta(frontMatter, location.pathname, navigation);

        return (
            <ReactPageShell
                site={constants.SITE}
                subsite={'Style Specification'}
                {...this.props}
                meta={meta}
                darkHeaderText={true}
            >
                <PageLayout
                    domain={{
                        title: 'MapLibre',
                        path: 'https://maplibre.org/'
                    }}
                    hideSearch={true}
                    location={location}
                    frontMatter={{
                        ...frontMatter,
                        ...(frontMatter.overviewHeader && {
                            overviewHeader: {
                                ...frontMatter.overviewHeader,
                                version: styleSpecVersion,
                                ...(frontMatter.overviewHeader.image && {
                                    image: (
                                        <div className="overview-header-browser mb6">
                                            <Browser>
                                                <AppropriateImage
                                                    imageId={
                                                        frontMatter
                                                            .overviewHeader
                                                            .image
                                                    }
                                                    alt=""
                                                    className="hmax300"
                                                />
                                            </Browser>
                                        </div>
                                    )
                                })
                            }
                        }),
                        headings: this.renderCustomHeadings()
                    }}
                    constants={constants}
                    navigation={navigation}
                    filters={filters}
                    AppropriateImage={AppropriateImage}
                    // use custom sidebar for API and Style Spec since this data needs to be generated
                    customAside={this.renderCustomAside()}
                >
                    <div
                        className={classnames('', {
                            'style-spec-page': true
                        })}
                    >
                        {children}
                    </div>
                </PageLayout>
            </ReactPageShell>
        );
    }
}

PageShell.propTypes = {
    meta: PropTypes.object,
    frontMatter: PropTypes.object.isRequired,
    children: PropTypes.node,
    location: PropTypes.object.isRequired,
    headings: PropTypes.array
};

export default withLocation(PageShell);

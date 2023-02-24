// this script is executed as a dataSelector in batfish.config.js
// the content is available with:
// import apiNavigation from '@mapbox/batfish/data/api-navigation';
// when making changes to this file, you must rerun batfish (npm start)
const slug = require('slugg');
const apiFilterItems = require('../util/api-filter-items.js');

module.exports = [
    {
        title: 'Introduction',
        path: '/maplibre-gl-js-docs/api/',
        subnav: [
            {
                title: 'Quickstart',
                path: 'quickstart'
            },
            {
                title: 'Reading this documentation',
                path: 'reading-this-documentation'
            },
            {
                title: 'CSP Directives',
                path: 'csp-directives'
            },
            {
                title: 'Referrer Policies',
                path: 'referrer-policies'
            },
            {
                title: 'MapLibre CSS',
                path: 'maplibre-css'
            }
        ]
    },
    {
        title: 'Map',
        path: '/maplibre-gl-js-docs/api/map/',
        subnav: buildSubSubNav(
            apiFilterItems('Map class')[0].members.static[0], // Hack to resolve naming documentation.yml conflict b/w the "Map" class and the "Map" section
            'map',
            2
        )
    },
    {
        title: 'Properties and options',
        path: '/maplibre-gl-js-docs/api/properties/',
        subnav: buildSubNav('Properties and options')
    },
    {
        title: 'Markers and controls',
        path: '/maplibre-gl-js-docs/api/markers/',
        subnav: buildSubNav('Markers and controls')
    },

    {
        title: 'Geography and geometry',
        path: '/maplibre-gl-js-docs/api/geography/',
        subnav: buildSubNav('Geography and geometry')
    },
    {
        title: 'User interaction handlers',
        path: '/maplibre-gl-js-docs/api/handlers/',
        subnav: buildSubNav('User interaction handlers')
    },
    {
        title: 'Sources',
        path: '/maplibre-gl-js-docs/api/sources/',
        subnav: buildSubNav('Sources')
    },
    {
        title: 'Events',
        path: '/maplibre-gl-js-docs/api/events/',
        subnav: buildSubNav('Events')
    }
];

function buildSubNav(section) {
    const items = apiFilterItems(section)[0].members.static;
    return items.reduce((arr, item) => {
        arr.push({
            text: item.name,
            slug: slug(item.namespace),
            level: 2
        });
        // append third level items right after second level items
        const thirdLevelItems = buildSubSubNav(item, item.name, 3);
        arr = arr.concat(thirdLevelItems);
        return arr;
    }, []);
}

function buildSubSubNav(item, section, level) {
    const arr = [];

    if (
        item.params &&
        item.params.length > 0 &&
        (item.kind !== 'class' ||
            !item.constructorComment ||
            item.constructorComment.access !== 'private')
    ) {
        arr.push({
            text: 'Parameters',
            slug: slug(`${section} Parameters`),
            level
        });
    }
    if (item.properties && item.properties.length > 0) {
        arr.push({
            text: 'Properties',
            path: slug(`${section} Properties`),
            level
        });
    }
    if (item.returns && item.returns.length > 0) {
        arr.push({
            text: 'Returns',
            slug: slug(`${section} Returns`),
            level
        });
    }
    if (item.examples && item.examples.length > 0) {
        arr.push({
            text: 'Example',
            slug: slug(`${section} Example`),
            level
        });
    }
    if (item.members && item.members.static.length > 0) {
        arr.push({
            text: 'Static members',
            slug: slug(`${section} Static members`),
            level
        });
    }
    if (item.members && item.members.instance.length > 0) {
        arr.push({
            text: 'Instance members',
            slug: slug(`${section} Instance members`),
            level
        });
    }
    if (item.members && item.members.events.length > 0) {
        arr.push({
            text: 'Events',
            slug: slug(`${section} Events`),
            level
        });
    }
    if (item.sees && item.sees.length > 0) {
        arr.push({
            text: 'Related',
            slug: slug(`${section} Related`),
            level
        });
    }

    return arr;
}

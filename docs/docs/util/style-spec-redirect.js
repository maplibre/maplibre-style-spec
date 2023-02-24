const expressionExceptions = [
    'data-expressions',
    'camera-expression',
    'composition',
    'type-system',
    'expression-reference'
];

const pageAllowList = [
    'root',
    'light',
    'sources',
    'sprite',
    'glyphs',
    'transition',
    'layers',
    'layer',
    'layout',
    'types',
    'expressions',
    'other',
    'paint'
];

function redirect(location) {
    // some "expressions" headings do not follow the pattern, so we'll set them first
    if (expressionExceptions.indexOf(location.hash.replace('#', '')) > -1) {
        return `/maplibre-gl-style-spec/style-spec/expressions/${location.hash}`;
    }

    // if the page does not exist in pageAllowList, return and do nothing
    // this will prevent 404s
    if (
        pageAllowList.indexOf(location.hash.split('-')[0].replace('#', '')) ===
        -1
    )
        return;

    // keep #other-filter as is
    if (location.hash === '#other-filter') {
        return `/maplibre-gl-style-spec/style-spec/other/#other-filter`;
    }
    // preserve hashes for #paint-* and #layout-* and send to "layers" page
    if (
        location.hash.split('-')[0] === '#paint' ||
        location.hash.split('-')[0] === '#layout'
    ) {
        return `/maplibre-gl-style-spec/style-spec/layers/${location.hash}`;
    }
    // split the hash by dashes
    const hash = location.hash.split('-');
    // the first item is the page name
    let page = hash[0].replace('#', '');

    // except if the page is "layer" or "layout" then replace it with "layers"
    if (page === 'layer' || page === 'layout') page = 'layers';
    // remove the first item in the hash array (page name) to get the hash
    hash.splice(0, 1);
    return `/maplibre-gl-style-spec/style-spec/${page}/${
        hash.length ? `#${hash.join('-')}` : ''
    }`;
}

module.exports = redirect;

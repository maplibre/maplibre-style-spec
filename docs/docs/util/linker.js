const { findPage } = require('./find-page');
const GithubSlugger = require('github-slugger');

function linker(namespace) {
    const page = findPage(namespace);
    const path = page ? `/maplibre-gl-js-docs/api/${page}/` : '';
    if (namespace.indexOf('.') > -1) {
        return `${path}#${namespace.toLowerCase()}`;
    } else {
        const slugger = new GithubSlugger();
        const names = namespace.split('#');
        const nv = names.map((v) => `#${slugger.slug(v)}`).join('');
        return `${path}${nv}`;
    }
}

module.exports = {
    linker
};

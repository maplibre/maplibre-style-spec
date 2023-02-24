const pluginSections = require('./plugins.json');
const GithubSlugger = require('github-slugger');

const slugger = new GithubSlugger();

const formatPlugins = (pluginSection) => {
    return Object.keys(pluginSection).map((plugin) => {
        return {
            text: plugin,
            title: plugin,
            url: pluginSection[plugin].website
        };
    });
};

const pluginTopics = Object.keys(pluginSections).reduce((arr, section) => {
    const plugins = formatPlugins(pluginSections[section]);
    arr.push({
        count: plugins.length,
        name: section,
        pages: plugins,
        url: `#${slugger.slug(section)}`
    });
    slugger.reset();
    return arr;
}, []);

module.exports = pluginTopics;

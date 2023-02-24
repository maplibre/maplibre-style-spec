const docs = require('../components/api.json');

module.exports = (pageName) => docs.filter((doc) => doc.name === pageName);

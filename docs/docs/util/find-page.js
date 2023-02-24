const docs = require('../components/api.json');

// returns the page name that the namespace appears on
function findPage(namespace) {
    if (!namespace) return;
    namespace = namespace.toLowerCase();
    return docs.reduce((str, doc) => {
        const matches = scan(doc, namespace, doc);
        if (matches) str = matches;
        return str;
    }, '');
}

// recursive function to check search check namespaces within members
function scan(items, namespace, doc) {
    if (items.members) {
        return Object.keys(items.members).reduce((str, type) => {
            items.members[type].forEach((member) => {
                if (
                    member.namespace &&
                    member.namespace.toLowerCase() === namespace
                ) {
                    str = doc.page;
                }
                // run again
                const matches = scan(member, namespace, doc);
                if (matches) str = matches;
            });
            return str;
        }, '');
    }
}

module.exports = {
    findPage
};

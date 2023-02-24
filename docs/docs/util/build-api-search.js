const { linker } = require('./linker');
const remark = require('remark');

const docs = require('../components/api.json');

function buildApiSearch() {
    return docs
        .reduce((arr, item) => {
            const items = scan(item);
            arr = arr.concat(items);
            return arr;
        }, [])
        .sort((a, b) => a.path.localeCompare(b.path));
}

function toString(ast) {
    return ast ? remark().stringify(ast) : '';
}

// recursive function to create a record for each item member
function scan(items) {
    if (items.members) {
        return Object.keys(items.members).reduce((arr, type) => {
            items.members[type].forEach((member) => {
                arr = arr.concat({
                    name: member.name,
                    namespace: member.namespace,
                    description: toString(member.description),
                    path: linker(member.namespace)
                });

                // run again
                const matches = scan(member);
                if (matches) arr = arr.concat(matches);
            });
            return arr;
        }, []);
    }
}

module.exports = {
    buildApiSearch
};

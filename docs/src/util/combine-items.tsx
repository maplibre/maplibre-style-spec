import ref from '../../../src/reference/latest';

// helper function to:
// combine properties, prepare them, and sort them for the <Items /> component
export default function combineItems(properties, section) {
    const arr = properties.map((property) => {
        return {
            ref: ref[`${property}_${section}`],
            kind: property,
            section: `${property}-${section}`
        };
    });
    // combine items
    const unsorted = arr.reduce((obj, group) => {
        Object.keys(group.ref).forEach((o) => {
            group.ref[o].kind = group.kind;
            group.ref[o].section = group.section;
            obj[o] = group.ref[o];
        });
        return obj;
    }, {});
    // sort & return items
    return Object.keys(unsorted)
        .sort()
        .reduce((obj, key) => {
            obj[key] = unsorted[key];
            return obj;
        }, {});
}

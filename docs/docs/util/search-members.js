import Fuse from 'fuse.js'; // https://fusejs.io/

// check string values in an array of objects for "search" term
export function searchMembers(arr, search) {
    if (!search || !arr || !Array.isArray(arr)) return [];
    const fuse = new Fuse(arr, {
        keys: ['name', 'description.children.children.value'], // keys to perform search on
        threshold: 0.3 // slightly stricter
    });
    return fuse.search(search)
        ? fuse.search(search).map((result) => result.item)
        : [];
}

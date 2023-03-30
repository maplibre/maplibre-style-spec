export function renderParams(params, maxLength) {
    const result = [''];
    for (const t of params) {
        if (typeof t === 'string') {
            result.push(t);
        } else if (t.repeat) {
            const repeated = renderParams(t.repeat, Infinity);
            result.push(`${repeated.slice(2)}${repeated}, ...`);
        }
    }

    // length of result = each (', ' + item)
    const length = result.reduce((l, s) => l + s.length + 2, 0);
    return !maxLength || length <= maxLength ?
        result.join(', ') :
        `${result.join(',\n    ')}\n`;
}

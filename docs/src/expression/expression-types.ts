import {expressions, expressionGroups} from './expressions';

const groupedExpressions = [
    'Types',
    'Feature data',
    'Lookup',
    'Decision',
    'Ramps, scales, curves',
    'Variable binding',
    'String',
    'Color',
    'Math',
    'Zoom',
    'Heatmap'
].map((group) => ({
    name: group,
    expressions: expressionGroups[group]
        .sort((a, b) => a.localeCompare(b))
        .map((name) => expressions[name])
}));

export {groupedExpressions};

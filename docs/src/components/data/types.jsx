import { expressions, expressionGroups } from '../style-spec/expressions.jsx';
import { h } from 'preact'
const sourceTypes = [
    'vector',
    'raster',
    'raster-dem',
    'geojson',
    'image',
    'video'
];

const layerTypes = [
    'background',
    'fill',
    'line',
    'symbol',
    'raster',
    'circle',
    'fill-extrusion',
    'heatmap',
    'hillshade'
];

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

export { sourceTypes, layerTypes, groupedExpressions };

import entries from 'object.entries';
import slug from 'slugg';
import ref from '../../maplibre-gl-js/rollup/build/tsc/src/style-spec/reference/latest';
import { layerTypes, groupedExpressions } from './types';

/*
This object powers the sidebar navigation for the Style Specification page.
IMPORTANT: Match the heading (h2, h3) and <Property> hierarchy found in each respective page.
*/

const icons = {
    paint: 'paint',
    layout: 'line'
};

// generates subnav using the style-spec reference data
function makeSubNav(entry, section, level) {
    return entries(entry)
        .sort()
        .reduce((arr, [name]) => {
            if (
                [
                    'vector',
                    'raster',
                    'raster-dem',
                    'geojson',
                    'image',
                    'video'
                ].indexOf(section) > -1 &&
                (name === '*' || name === 'type')
            ) {
                return arr;
            } else {
                const sectionName = section ? section.split('-')[0] : undefined;
                const icon =
                    section && sectionName ? icons[sectionName] : undefined;
                arr.push({
                    text: name,
                    slug: `${section ? `${section}-` : ''}${name}`,
                    level,
                    ...(icon && { icon: icon })
                });
            }

            return arr;
        }, []);
}

export const styleSpecNavigation = [
    { title: 'Introduction', path: '/maplibre-gl-style-spec/style-spec/' },
    {
        title: 'Root',
        path: '/maplibre-gl-style-spec/style-spec/root/',
        subnav: makeSubNav(ref.$root, null, 2)
    },
    {
        title: 'Sources',
        path: '/maplibre-gl-style-spec/style-spec/sources/',
        subnav: [
            {
                text: 'vector',
                slug: 'vector',
                level: 2
            },
            ...makeSubNav(ref.source_vector, 'vector', 3),
            {
                text: 'raster',
                slug: 'raster',
                level: 2
            },
            ...makeSubNav(ref.source_raster, 'raster', 3),
            {
                text: 'raster-dem',
                slug: 'raster-dem',
                level: 2
            },
            ...makeSubNav(ref.source_raster_dem, 'raster-dem', 3),
            {
                text: 'geojson',
                slug: 'geojson',
                level: 2
            },
            ...makeSubNav(ref.source_geojson, 'geojson', 3),
            {
                text: 'image',
                slug: 'image',
                level: 2
            },
            ...makeSubNav(ref.source_image, 'image', 3),
            {
                text: 'video',
                slug: 'video',
                level: 2
            },
            ...makeSubNav(ref.source_video, 'video', 3)
        ]
    },
    {
        title: 'Layers',
        path: '/maplibre-gl-style-spec/style-spec/layers/',
        subnav: layerTypes.reduce((arr, type) => {
            arr.push({
                text: type,
                slug: type,
                level: 2
            });
            const thirdLevelItems = [
                ...makeSubNav(ref[`layout_${type}`], `layout-${type}`, 3),
                ...makeSubNav(ref[`paint_${type}`], `paint-${type}`, 3)
            ].sort((a, b) => a.text.localeCompare(b.text));
            arr = arr.concat(thirdLevelItems);
            return arr;
        }, [])
    },
    {
        title: 'Expressions',
        path: '/maplibre-gl-style-spec/style-spec/expressions/',
        subnav: groupedExpressions.reduce((arr, group) => {
            arr.push({
                text: group.name,
                slug: `${slug(group.name)}`,
                level: 2
            });
            const thirdLevelItems = group.expressions.map((g) => {
                return {
                    text: g.name,
                    slug: `${group.name === 'Types' ? 'types-' : ''}${
                        slug(g.name) || g.name
                    }`,
                    level: 3
                };
            });
            arr = arr.concat(thirdLevelItems);
            return arr;
        }, [])
    },
    {
        title: 'Types',
        path: '/maplibre-gl-style-spec/style-spec/types/',
        subnav: [
            {
                text: 'Color',
                slug: 'color',
                level: 2
            },
            {
                text: 'Formatted',
                slug: 'formatted',
                level: 2
            },
            {
                text: 'ResolvedImage',
                slug: 'resolvedimage',
                level: 2
            },
            {
                text: 'String',
                slug: 'string',
                level: 2
            },
            {
                text: 'Boolean',
                slug: 'boolean',
                level: 2
            },
            {
                text: 'Number',
                slug: 'number',
                level: 2
            },
            {
                text: 'Array',
                slug: 'array',
                level: 2
            }
        ]
    },
    {
        title: 'Sprite',
        path: '/maplibre-gl-style-spec/style-spec/sprite/'
    },
    {
        title: 'Glyphs',
        path: '/maplibre-gl-style-spec/style-spec/glyphs/'
    },
    {
        title: 'Transition',
        path: '/maplibre-gl-style-spec/style-spec/transition/',
        subnav: makeSubNav(ref.transition, null, 2)
    },
    {
        title: 'Light',
        path: '/maplibre-gl-style-spec/style-spec/light/',
        subnav: makeSubNav(ref.light, null, 2)
    },
    {
        title: 'Other',
        path: '/maplibre-gl-style-spec/style-spec/other/',
        tag: 'legacy',
        subnav: [
            {
                text: 'Function',
                slug: 'function',
                level: 2
            },
            ...[
                'stops',
                'property',
                'base',
                'type',
                'default',
                'colorSpace'
            ].map((text) => {
                return {
                    text,
                    slug: `function-${text}`,
                    level: 3
                };
            }),
            {
                text: 'Other filter',
                slug: 'other-filter',
                level: 2
            },
            ...[
                'Existential filters',
                'Comparison filters',
                'Set membership filters',
                'Combining filters'
            ].map((text) => {
                return {
                    text,
                    slug: slug(text),
                    level: 3
                };
            })
        ]
    }
];

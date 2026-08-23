import type {Plugin} from 'rolldown';

function replacer(key: string, value: any) {
    return key === 'doc' || key === 'example' || key === 'sdk-support' ? undefined : value;
}

/**
 * This plugin minifies the style specification by removing the `doc`, `example`, and `sdk-support` properties from the JSON files in the `reference` directory.
 * It also removes the `expression_name` property from the root of the JSON files.
 * @returns A rollup/down plugin
 */
export default function minifyStyleSpec(): Plugin {
    return {
        name: 'minify-style-spec',
        transform: (source, id) => {
            if (!/reference[\\/]v[0-9]+\.json$/.test(id)) {
                return;
            }

            const spec = JSON.parse(source);

            delete spec['expression_name'];

            return {
                code: JSON.stringify(spec, replacer, 0),
                map: {mappings: ''}
            };
        }
    };
}

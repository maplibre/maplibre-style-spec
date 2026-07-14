import minifyStyleSpec from './build/rollup_plugin_minify_style_spec';
import {defineConfig, type RolldownOptions} from 'rolldown';
import {dts} from 'rolldown-plugin-dts';
import packageJSON from './package.json' with {type: 'json'};

const typesOnly = process.env.BUILD === 'types';

/**
 * Removes bare `.json` side-effect imports from the emitted `.d.ts`.
 * rolldown-plugin-dts leaves them, e.g. `import "./reference/v8.json";`.
 * tsgo rejects them with TS2882: the JSON isn't resolvable next to the `.d.ts`.
 * @returns A rolldown plugin.
 */
function stripJsonSideEffectImports(): NonNullable<RolldownOptions['plugins']> {
    return {
        name: 'strip-json-side-effect-imports',
        generateBundle(_options, bundle) {
            for (const file of Object.values(bundle)) {
                if (file.type === 'chunk' && file.fileName.endsWith('.d.ts')) {
                    file.code = file.code.replace(
                        /^import\s+["'][^"']+\.json["'];?[ \t]*\r?\n/gm,
                        ''
                    );
                }
            }
        }
    };
}

const dtsBundle: RolldownOptions = {
    input: {index: 'src/index.ts'},
    output: {
        dir: 'dist',
        format: 'es'
    },
    external: [...Object.keys(packageJSON.dependencies), /\.json$/],
    plugins: [dts({emitDtsOnly: true, tsgo: true}), stripJsonSideEffectImports()]
};

const bundles: RolldownOptions[] = [
    {
        resolve: {
            mainFields: ['browser', 'module', 'main']
        },
        input: './src/index.ts',
        output: [
            {
                file: 'dist/index.mjs',
                format: 'es',
                sourcemap: true
            },
            {
                name: 'maplibreGlStyleSpecification',
                file: 'dist/index.cjs',
                format: 'umd',
                sourcemap: true,
                globals: {'node:fs': 'fs'}
            }
        ],
        plugins: [minifyStyleSpec()]
    },
    {
        resolve: {
            mainFields: ['browser', 'module', 'main']
        },
        platform: 'node',
        input: './bin/gl-style-format.ts',
        output: [
            {
                file: 'dist/gl-style-format.mjs',
                format: 'es',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            },
            {
                file: 'dist/gl-style-format.cjs',
                format: 'cjs',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            }
        ],
        plugins: [minifyStyleSpec()]
    },
    {
        resolve: {
            mainFields: ['browser', 'module', 'main']
        },
        platform: 'node',
        input: './bin/gl-style-migrate.ts',
        output: [
            {
                file: 'dist/gl-style-migrate.mjs',
                format: 'es',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            },
            {
                file: 'dist/gl-style-migrate.cjs',
                format: 'cjs',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            }
        ],
        plugins: [minifyStyleSpec()]
    },
    {
        resolve: {
            mainFields: ['browser', 'module', 'main']
        },
        platform: 'node',
        input: './bin/gl-style-validate.ts',
        output: [
            {
                file: 'dist/gl-style-validate.mjs',
                format: 'es',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            },
            {
                file: 'dist/gl-style-validate.cjs',
                format: 'cjs',
                sourcemap: true,
                banner: '#!/usr/bin/env node\n'
            }
        ],
        plugins: [minifyStyleSpec()]
    }
];

export default defineConfig(typesOnly ? [dtsBundle] : [...bundles, dtsBundle]);

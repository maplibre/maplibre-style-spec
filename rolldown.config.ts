import replace from '@rollup/plugin-replace';
import minifyStyleSpec from './build/rollup_plugin_minify_style_spec';
import shebang from 'rollup-plugin-preserve-shebang';
import {defineConfig, type RolldownOptions} from 'rolldown';
import {dts} from 'rolldown-plugin-dts';
import packageJSON from './package.json' with {type: 'json'};

const typesOnly = process.env.BUILD === 'types';

const rollupPlugins = [
    minifyStyleSpec(),
    // https://github.com/zaach/jison/issues/351
    replace({
        preventAssignment: true,
        include: /\/jsonlint-lines-primitives\/lib\/jsonlint.js/,
        delimiters: ['', ''],
        values: {
            '_token_stack:': ''
        }
    })
];

const dtsBundle: RolldownOptions = {
    input: {index: 'src/index.ts'},
    output: {
        dir: 'dist',
        format: 'es'
    },
    external: [...Object.keys(packageJSON.dependencies), /\.json$/],
    plugins: [dts({emitDtsOnly: true, tsgo: true})]
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
        plugins: rollupPlugins
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
                sourcemap: true
            },
            {
                file: 'dist/gl-style-format.cjs',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [...rollupPlugins, shebang()]
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
                sourcemap: true
            },
            {
                file: 'dist/gl-style-migrate.cjs',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [...rollupPlugins, shebang()]
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
                sourcemap: true
            },
            {
                file: 'dist/gl-style-validate.cjs',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [...rollupPlugins, shebang()]
    }
];

export default defineConfig(typesOnly ? [dtsBundle] : [...bundles, dtsBundle]);

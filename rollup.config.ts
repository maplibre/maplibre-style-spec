import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import {RollupOptions} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import minifyStyleSpec from './build/rollup_plugin_minify_style_spec';
import shebang from 'rollup-plugin-preserve-shebang';

const rollupPlugins = [
    minifyStyleSpec(),
    json(),
    resolve({
        browser: true,
        preferBuiltins: true,
        // Some users reference modules within style-spec package directly, instead of the bundle
        // This means that files within the style-spec package should NOT import files from the parent maplibre-gl-js tree.
        // This check will cause the build to fail on CI allowing these issues to be caught.
        jail: 'src/',
    }),
    // https://github.com/zaach/jison/issues/351
    replace({
        preventAssignment: true,
        include: /\/jsonlint-lines-primitives\/lib\/jsonlint.js/,
        delimiters: ['', ''],
        values: {
            '_token_stack:': ''
        }
    }),
    typescript({
        compilerOptions: {
            declaration: false,
        }
    }),
    commonjs()
];

const config: RollupOptions[] = [{
    input: './src/style-spec.ts',
    output: [{
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
    },
    {
        name: 'maplibreGlStyleSpecification',
        file: 'dist/index.cjs',
        format: 'umd',
        sourcemap: true
    }],
    plugins: rollupPlugins
},
{
    input: './bin/gl-style-format.ts',
    output: [{
        file: 'dist/gl-style-format.mjs',
        format: 'es',
        sourcemap: true
    },
    {
        name: 'maplibreGlStyleSpecification',
        file: 'dist/gl-style-format.cjs',
        format: 'umd',
        sourcemap: true
    }],
    plugins: [...rollupPlugins, shebang()]
},
{
    input: './bin/gl-style-migrate.ts',
    output: [{
        file: 'dist/gl-style-migrate.mjs',
        format: 'es',
        sourcemap: true
    },
    {
        name: 'maplibreGlStyleSpecification',
        file: 'dist/gl-style-migrate.cjs',
        format: 'umd',
        sourcemap: true
    }],
    plugins: [...rollupPlugins, shebang()]
},
{
    input: './bin/gl-style-validate.ts',
    output: [{
        file: 'dist/gl-style-validate.mjs',
        format: 'es',
        sourcemap: true
    },
    {
        name: 'maplibreGlStyleSpecification',
        file: 'dist/gl-style-validate.cjs',
        format: 'umd',
        sourcemap: true
    }],
    plugins: [...rollupPlugins, shebang()]
}];
export default config;

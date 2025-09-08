import replace from '@rollup/plugin-replace';
import minifyStyleSpec from './build/rollup_plugin_minify_style_spec';
import shebang from 'rollup-plugin-preserve-shebang';
import {defineConfig} from 'rolldown';

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

const config = defineConfig([{
    input: './src/index.ts',
    output: [{
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true
    },
    {
        name: 'maplibreGlStyleSpecification',
        file: 'dist/index.cjs',
        format: 'umd',
        sourcemap: true,
        globals: {
            fs: 'fs'
        }
    }],
    plugins: rollupPlugins,
    external: ['fs'],
    resolve: {
        mainFields: ['browser', 'module', 'main']
    },
    onLog(_level, log) {
        // Suppress missing export warnings for TypeScript type-only exports
        if (log.code === 'MISSING_EXPORT' && log.message.includes('This diagnostic might be a false positive')) {
            return false;
        }
    }
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
        sourcemap: true,
        globals: {
            fs: 'fs'
        }
    }],
    plugins: [...rollupPlugins, shebang()],
    external: ['fs'],
    resolve: {
        mainFields: ['browser', 'module', 'main']
    },
    onLog(_level, log) {
        // Suppress missing export warnings for TypeScript type-only exports
        if (log.code === 'MISSING_EXPORT' && log.message.includes('This diagnostic might be a false positive')) {
            return false;
        }
    }
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
        sourcemap: true,
        globals: {
            fs: 'fs'
        }
    }],
    plugins: [...rollupPlugins, shebang()],
    external: ['fs'],
    resolve: {
        mainFields: ['browser', 'module', 'main']
    },
    onLog(_level, log) {
        // Suppress missing export warnings for TypeScript type-only exports
        if (log.code === 'MISSING_EXPORT' && log.message.includes('This diagnostic might be a false positive')) {
            return false;
        }
    }
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
        sourcemap: true,
        globals: {
            fs: 'fs'
        }
    }],
    plugins: [...rollupPlugins, shebang()],
    external: ['fs'],
    resolve: {
        mainFields: ['browser', 'module', 'main']
    },
    onLog(_level, log) {
        // Suppress missing export warnings for TypeScript type-only exports
        if (log.code === 'MISSING_EXPORT' && log.message.includes('This diagnostic might be a false positive')) {
            return false;
        }
    }
}]);
export default config;

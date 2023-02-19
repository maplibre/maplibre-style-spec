import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
const config = [{
        input: 'src/style-spec.ts',
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
        plugins: [
            json(),
            resolve({
                browser: true,
                preferBuiltins: false,
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
            typescript(),
            commonjs()
        ]
    }];
export default config;
//# sourceMappingURL=rollup.config.style-spec.js.map
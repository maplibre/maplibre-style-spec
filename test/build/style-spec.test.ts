import {readdir} from 'fs/promises';
import reference from '../../src/reference/latest';
import fs from 'fs';

const minBundle = fs.readFileSync('dist/index.mjs', 'utf8');

describe('@maplibre/maplibre-gl-style-spec npm package', () => {
    test('files build', async () => {
        expect(await readdir('dist')).toMatchInlineSnapshot(`
[
  "gl-style-format.cjs",
  "gl-style-format.cjs.map",
  "gl-style-format.mjs",
  "gl-style-format.mjs.map",
  "gl-style-migrate.cjs",
  "gl-style-migrate.cjs.map",
  "gl-style-migrate.mjs",
  "gl-style-migrate.mjs.map",
  "gl-style-validate.cjs",
  "gl-style-validate.cjs.map",
  "gl-style-validate.mjs",
  "gl-style-validate.mjs.map",
  "index.cjs",
  "index.cjs.map",
  "index.d.ts",
  "index.mjs",
  "index.mjs.map",
]
`);
    });

    test('exports components directly, not behind `default` - https://github.com/mapbox/mapbox-gl-js/issues/6601', async  () => {

        expect(await import('../../dist/index.cjs')).toHaveProperty('validateStyleMin');
    });

    test('trims reference.json fields', () => {
        expect(reference.$root.version.doc).toBeTruthy();
        expect(minBundle.includes(reference.$root.version.doc)).toBeFalsy();
    });
});

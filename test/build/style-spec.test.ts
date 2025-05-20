import {readdir} from 'fs/promises';
import {latest} from '../../src/reference/latest';
import {latest as latestInBundle} from '../../dist/index';
import fs from 'fs';
import {describe, test, expect} from 'vitest';
const minBundle = fs.readFileSync('dist/index.mjs', 'utf8');

describe('@maplibre/maplibre-gl-style-spec npm package', () => {
    test('files build', async () => {
        const dirContents = await readdir('dist');
        expect(dirContents).toContain('gl-style-format.cjs');
        expect(dirContents).toContain('gl-style-format.cjs.map');
        expect(dirContents).toContain('gl-style-format.mjs');
        expect(dirContents).toContain('gl-style-format.mjs.map');
        expect(dirContents).toContain('gl-style-migrate.cjs');
        expect(dirContents).toContain('gl-style-migrate.cjs.map');
        expect(dirContents).toContain('gl-style-migrate.mjs');
        expect(dirContents).toContain('gl-style-migrate.mjs.map');
        expect(dirContents).toContain('gl-style-validate.cjs');
        expect(dirContents).toContain('gl-style-validate.cjs.map');
        expect(dirContents).toContain('gl-style-validate.mjs');
        expect(dirContents).toContain('gl-style-validate.mjs.map');
        expect(dirContents).toContain('index.cjs');
        expect(dirContents).toContain('index.cjs.map');
        expect(dirContents).toContain('index.d.ts');
        expect(dirContents).toContain('index.mjs');
        expect(dirContents).toContain('index.mjs.map');
        expect(dirContents).toContain('latest.json');
        expect(dirContents).toHaveLength(18);
    });

    test('exports components directly, not behind `default` - https://github.com/mapbox/mapbox-gl-js/issues/6601', async  () => {

        expect(await import('../../dist/index.cjs')).toHaveProperty('validateStyleMin');
    });

    test('trims reference.json fields', () => {
        expect(latest.$root.version.doc).toBeTruthy();
        expect(minBundle.includes(latest.$root.version.doc)).toBeFalsy();
    });

    test('"latest" entry point should be defined', async () => {        
        expect(latestInBundle).toBeDefined();
    });
});

import {readdir} from 'fs/promises';
import {latest} from '../../src/reference/latest';
import {latest as latestInBundle} from '../../dist';
import fs from 'fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, test, expect} from 'vitest';
const minBundle = fs.readFileSync('dist/index.mjs', 'utf8');
const validStyle = JSON.stringify({version: 8, sources: {}, layers: []});

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

    test('exports components directly, not behind `default` - https://github.com/mapbox/mapbox-gl-js/issues/6601', async () => {
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

describe('CLI binaries', () => {
    test.each([
        ['gl-style-validate', 'mjs'],
        ['gl-style-validate', 'cjs'],
        ['gl-style-format', 'mjs'],
        ['gl-style-format', 'cjs'],
        ['gl-style-migrate', 'mjs'],
        ['gl-style-migrate', 'cjs']
    ])('%s.%s starts without throwing', (cli, ext) => {
        const result = spawnSync('node', [`dist/${cli}.${ext}`, '--help'], {encoding: 'utf8'});
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
    });

    test('gl-style-validate accepts a file path', () => {
        const path = join(tmpdir(), 'maplibre-style-spec-valid.json');
        fs.writeFileSync(path, validStyle);
        const result = spawnSync('node', ['dist/gl-style-validate.mjs', path], {encoding: 'utf8'});
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
    });

    test('gl-style-validate accepts stdin', () => {
        const result = spawnSync('node', ['dist/gl-style-validate.mjs'], {
            encoding: 'utf8',
            input: validStyle
        });
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
    });

    test('gl-style-validate exits 1 and reports errors for an invalid style', () => {
        const result = spawnSync('node', ['dist/gl-style-validate.mjs'], {
            encoding: 'utf8',
            input: '{"version": 7, "sources": {}, "layers": "nope"}'
        });
        expect(result.status).toBe(1);
        expect(result.stdout).toContain('version: expected one of [8]');
    });
});

import {globSync} from 'glob';
import fs from 'fs';
import path from 'path';
import {validateStyle as validate} from '../../../src/validate_style';
import {latest} from '../../../src/reference/latest';
import {describe, expect, test} from 'vitest';
const UPDATE = !!process.env.UPDATE;

type SdkSupportItem = {
    js?: string;
    android?: string;
    ios?: string;
};

type SdkSupportMatrix = Record<string, SdkSupportItem>;

describe('validate_spec', () => {
    globSync('test/integration/style-spec/tests/*.input.json').forEach((file) => {
        test(path.basename(file), () => {
            const outputfile = file.replace('.input', '.output');
            const style = fs.readFileSync(file);
            const result = validate(style);
            if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
            const expectedOutput = JSON.parse(fs.readFileSync(outputfile).toString());
            expect(result).toEqual(expectedOutput);
        });
    });

    test('errors from validate do not contain line numbers', () => {
        const style = JSON.parse(
            fs.readFileSync('test/integration/style-spec/tests/bad-color.input.json', 'utf8')
        );

        const result = validate(style, latest);
        expect(result[0].line).toBeUndefined();
    });
});

describe('Validate sdk-support in spec', () => {
    const issueTrackers = {
        js: 'https://github.com/maplibre/maplibre-gl-js/issues',
        android: 'https://github.com/maplibre/maplibre-native/issues',
        ios: 'https://github.com/maplibre/maplibre-native/issues'
    };
    const platforms = Object.keys(issueTrackers) as (keyof SdkSupportItem)[];

    function validatePlatforms(platformSupport: SdkSupportItem, path: string[]) {
        const notSupportedOnAnyPlatform = platforms.every((platform) => !platformSupport[platform]);

        for (const platform of platforms) {
            test(`Validate sdk-support ${path.join('.')}`, () => {
                if (notSupportedOnAnyPlatform) {
                    // don't consider it a problem is something is not supported on any platform
                    return;
                }

                const support = platformSupport[platform]!;
                expect(
                    support,
                    `Missing platform '${platform}' in sdk-support at ${path.join('.')}. Please create a tracking issue and add the link.`
                ).toBeTruthy();

                const maplibreIssue = /https:\/\/github.com\/maplibre\/[^/]+\/issues\/(\d+)/;
                const version = /^\d+\.\d+\.\d+$/;
                const values = new Set(['supported', 'wontfix']);

                const supportValid = Boolean(
                    support.match(maplibreIssue) || support.match(version) || values.has(support)
                );
                // Only the following values are supported:
                // - If supported: version number (e.g. 1.0.0) to indicate support since this version (or "supported" to indicate it has always been supported)
                // - If it will never be supported: "wontfix" to indicate it will never be supported
                // - A link to a tracking issue
                expect(supportValid).toBe(true);
            });
        }
    }

    /**
     * @param sdkSupportObj - { "sdk-support": ... }
     * @param path - path in style spec where this object was found
     */
    function validateSdkSupport(sdkSupportObj: SdkSupportMatrix, path: string[]) {
        Object.entries(sdkSupportObj).map(([key, obj]) => validatePlatforms(obj, [...path, key]));
    }

    /**
     * Recursive function to traverse style spec and look for { "sdk-support": ... }
     * */
    function checkRoot(specRoot: any, path: string[]) {
        Object.keys(specRoot).forEach((key) => {
            if (key === 'sdk-support') {
                validateSdkSupport(specRoot[key], path);
                return;
            }
            if (typeof specRoot[key] === 'object') {
                checkRoot(specRoot[key], [...path, key]);
            }
        });
    }

    checkRoot(latest, []);
});

import { types } from '../expression-metadata';
import ref from '../../../maplibre-gl-js/rollup/build/tsc/src/style-spec/reference/latest';

// help us catch that every type in expression-metadata.js exists in the style-spec
// otherwise the site will not build
describe('expression-metadata.js type exists in maplibre-gl-js-style-spec', () => {
    for (const name in types) {
        it(name, () => {
            expect(ref['expression_name'].values[name]).not.toBeUndefined();
        });
    }
});

// help us catch expressions we need to add to expression-metadata.js during version bumps
// otherwise the definition/type will not be added to the site
describe('maplibre-gl-js-style-spec expression appears in expression-metadata.js', () => {
    for (let name in ref['expression_name'].values) {
        if (!/^filter-/.test(name) && name !== 'error') {
            it(name, () => {
                expect(types[name]).not.toBeUndefined();
            });
        }
    }
});

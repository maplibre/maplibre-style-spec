import test from 'tape';
import redirect from '../docs/util/style-spec-redirect.js';

test(`style-spec-redirect`, (t) => {
    t.equal(
        redirect({
            hash: '#light-anchor'
        }),
        '/maplibre-gl-style-spec/style-spec/light/#anchor'
    );

    t.equal(
        redirect({
            hash: '#root-version'
        }),
        '/maplibre-gl-style-spec/style-spec/root/#version'
    );

    t.equal(
        redirect({
            hash: '#sources-vector'
        }),
        '/maplibre-gl-style-spec/style-spec/sources/#vector'
    );

    t.equal(
        redirect({
            hash: '#sources-vector-url'
        }),
        '/maplibre-gl-style-spec/style-spec/sources/#vector-url'
    );

    t.equal(
        redirect({
            hash: '#sources-raster-dem-url'
        }),
        '/maplibre-gl-style-spec/style-spec/sources/#raster-dem-url'
    );

    t.equal(
        redirect({
            hash: '#sprite'
        }),
        '/maplibre-gl-style-spec/style-spec/sprite/'
    );

    t.equal(
        redirect({
            hash: '#glyphs'
        }),
        '/maplibre-gl-style-spec/style-spec/glyphs/'
    );

    t.equal(
        redirect({
            hash: '#transition-duration'
        }),
        '/maplibre-gl-style-spec/style-spec/transition/#duration'
    );

    t.equal(
        redirect({
            hash: '#layer-id'
        }),
        '/maplibre-gl-style-spec/style-spec/layers/#id'
    );
    t.equal(
        redirect({
            hash: '#layers-background'
        }),
        '/maplibre-gl-style-spec/style-spec/layers/#background'
    );
    t.equal(
        redirect({
            hash: '#layout-background-visibility'
        }),
        '/maplibre-gl-style-spec/style-spec/layers/#layout-background-visibility'
    );

    t.equal(
        redirect({
            hash: '#types-color'
        }),
        '/maplibre-gl-style-spec/style-spec/types/#color'
    );

    t.equal(
        redirect({
            hash: '#data-expressions'
        }),
        '/maplibre-gl-style-spec/style-spec/expressions/#data-expressions'
    );

    t.equal(
        redirect({
            hash: '#expressions-types-array'
        }),
        '/maplibre-gl-style-spec/style-spec/expressions/#types-array'
    );

    t.equal(
        redirect({
            hash: '#other-function'
        }),
        '/maplibre-gl-style-spec/style-spec/other/#function'
    );

    t.equal(
        redirect({
            hash: '#other-filter'
        }),
        '/maplibre-gl-style-spec/style-spec/other/#other-filter'
    );

    t.equal(
        redirect({
            hash: '#paint-fill-fill-color'
        }),
        '/maplibre-gl-style-spec/style-spec/layers/#paint-fill-fill-color'
    );

    t.equal(
        redirect({
            hash: '#hello-world'
        }),
        undefined
    );
    t.end();
});

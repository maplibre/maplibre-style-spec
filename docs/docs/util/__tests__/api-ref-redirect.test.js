import redirect from '../api-ref-redirect';

it(`api-ref-redirect`, () => {
    expect(
        redirect({
            hash: '#poptarts'
        })
    ).toEqual(undefined);

    expect(
        redirect({
            hash: '#map'
        })
    ).toEqual('/maplibre-gl-js-docs/api/map/#map');

    expect(
        redirect({
            hash: '#map#scrollzoom'
        })
    ).toEqual('/maplibre-gl-js-docs/api/map/#map#scrollzoom');

    expect(
        redirect({
            hash: '#map.event:mouseover'
        })
    ).toEqual('/maplibre-gl-js-docs/api/map/#map.event:mouseover');

    expect(
        redirect({
            hash: '#lnglat'
        })
    ).toEqual('/maplibre-gl-js-docs/api/geography/#lnglat');

    expect(
        redirect({
            hash: '#icontrol'
        })
    ).toEqual('/maplibre-gl-js-docs/api/markers/#icontrol');

    expect(
        redirect({
            hash: '#icontrol#getdefaultposition'
        })
    ).toEqual('/maplibre-gl-js-docs/api/markers/#icontrol#getdefaultposition');

    expect(
        redirect({
            hash: '#touchpitchhandler#isenabled'
        })
    ).toEqual('/maplibre-gl-js-docs/api/handlers/#touchpitchhandler#isenabled');

    expect(
        redirect({
            hash: '#canvassource#getcanvas'
        })
    ).toEqual('/maplibre-gl-js-docs/api/sources/#canvassource#getcanvas');

    expect(
        redirect({
            hash: '#mapwheelevent'
        })
    ).toEqual('/maplibre-gl-js-docs/api/events/#mapwheelevent');

    expect(
        redirect({
            hash: '#mapwheelevent#type'
        })
    ).toEqual('/maplibre-gl-js-docs/api/events/#mapwheelevent#type');

    expect(
        redirect({
            hash: '#clearprewarmedresources'
        })
    ).toEqual('/maplibre-gl-js-docs/api/properties/#clearprewarmedresources');
});

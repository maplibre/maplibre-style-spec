/* eslint-disable xss/no-mixed-html */

import { formatters, toHtml, formatType } from '../formatters';

describe('formatters', () => {
    it('autolink', () => {
        expect(formatters.autolink('Map#addLayer')).toEqual(
            '<a href="/maplibre-gl-js-docs/api/map/#map#addlayer">Map#addLayer</a>'
        );
        expect(formatters.autolink('Map.event:webglcontextlost')).toEqual(
            '<a href="/maplibre-gl-js-docs/api/map/#map.event:webglcontextlost">Map.event:webglcontextlost</a>'
        );
        expect(formatters.autolink('Map')).toEqual(
            '<a href="/maplibre-gl-js-docs/api/map/#map">Map</a>'
        );

        expect(formatters.autolink('GeolocateControl.event:error')).toEqual(
            '<a href="/maplibre-gl-js-docs/api/markers/#geolocatecontrol.event:error">GeolocateControl.event:error</a>'
        );
        expect(formatters.autolink('Popup.event:close')).toEqual(
            '<a href="/maplibre-gl-js-docs/api/markers/#popup.event:close">Popup.event:close</a>'
        );
    });

    it('parameters', () => {
        expect(
            formatters.parameters(
                {
                    params: [
                        {
                            title: 'param',
                            name: 'sourceId',
                            lineNumber: 5,

                            type: { type: 'NameExpression', name: 'string' }
                        },
                        {
                            title: 'param',
                            name: 'parameters',
                            lineNumber: 6,

                            type: {
                                type: 'OptionalType',
                                expression: {
                                    type: 'NameExpression',
                                    name: 'Object'
                                }
                            }
                        }
                    ]
                },
                true
            )
        ).toEqual('(sourceId, parameters?)');
    });

    it('type', () => {
        expect(
            formatters.type({ type: 'NameExpression', name: 'number' })
        ).toEqual(
            '<a href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>'
        );
    });

    it('markdown', () => {
        expect(
            formatters.markdown({
                type: 'root',
                children: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'inlineCode',
                                value: 'MapWheelEvent',
                                position: {
                                    start: { line: 1, column: 1, offset: 0 },
                                    end: { line: 1, column: 16, offset: 15 },
                                    indent: []
                                }
                            },
                            {
                                type: 'text',
                                value: ' is the event type for the ',
                                position: {
                                    start: { line: 1, column: 16, offset: 15 },
                                    end: { line: 1, column: 43, offset: 42 },
                                    indent: []
                                }
                            },
                            {
                                type: 'inlineCode',
                                value: 'wheel',
                                position: {
                                    start: { line: 1, column: 43, offset: 42 },
                                    end: { line: 1, column: 50, offset: 49 },
                                    indent: []
                                }
                            },
                            {
                                type: 'text',
                                value: ' map event.',
                                position: {
                                    start: { line: 1, column: 50, offset: 49 },
                                    end: { line: 1, column: 61, offset: 60 },
                                    indent: []
                                }
                            }
                        ],
                        position: {
                            start: { line: 1, column: 1, offset: 0 },
                            end: { line: 1, column: 61, offset: 60 },
                            indent: []
                        }
                    }
                ],
                position: {
                    start: { line: 1, column: 1, offset: 0 },
                    end: { line: 1, column: 61, offset: 60 }
                }
            })
        )
            .toEqual(`<p><code>MapWheelEvent</code> is the event type for the <code>wheel</code> map event.</p>
`);
    });
});

const fixture = {
    description: {
        type: 'root',
        children: [
            {
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        value:
                            'Fired when the user cancels a "box zoom" interaction, or when the bounding box does not meet the minimum size threshold.\nSee ',
                        position: {
                            start: {
                                line: 1,
                                column: 1,
                                offset: 0
                            },
                            end: {
                                line: 2,
                                column: 5,
                                offset: 125
                            },
                            indent: [1]
                        }
                    },
                    {
                        type: 'link',
                        url: 'BoxZoomHandler',
                        title: null,
                        jsdoc: true,
                        children: [
                            {
                                type: 'text',
                                value: 'BoxZoomHandler'
                            }
                        ],
                        position: {
                            start: {
                                line: 2,
                                column: 5,
                                offset: 125
                            },
                            end: {
                                line: 2,
                                column: 27,
                                offset: 147
                            },
                            indent: []
                        }
                    },
                    {
                        type: 'text',
                        value: '.',
                        position: {
                            start: {
                                line: 2,
                                column: 27,
                                offset: 147
                            },
                            end: {
                                line: 2,
                                column: 28,
                                offset: 148
                            },
                            indent: []
                        }
                    }
                ],
                position: {
                    start: {
                        line: 1,
                        column: 1,
                        offset: 0
                    },
                    end: {
                        line: 2,
                        column: 28,
                        offset: 148
                    },
                    indent: [1]
                }
            }
        ],
        position: {
            start: {
                line: 1,
                column: 1,
                offset: 0
            },
            end: {
                line: 2,
                column: 28,
                offset: 148
            }
        }
    }
};
describe('toHtml', () => {
    it('default', () => {
        expect(toHtml(fixture.description)).toMatchSnapshot();
    });
    it('inline', () => {
        expect(toHtml(fixture.description, true)).toMatchSnapshot();
    });
});

describe('formatType', () => {
    it('number', () => {
        expect(
            formatType({ type: 'NameExpression', name: 'number' })
        ).toMatchSnapshot();
    });
    it('expression', () => {
        expect(
            formatType({
                type: 'OptionalType',
                expression: { type: 'NameExpression', name: 'LngLatLike' }
            })
        ).toMatchSnapshot();
    });
});

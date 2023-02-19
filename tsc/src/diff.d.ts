declare const operations: {
    setStyle: string;
    addLayer: string;
    removeLayer: string;
    setPaintProperty: string;
    setLayoutProperty: string;
    setFilter: string;
    addSource: string;
    removeSource: string;
    setGeoJSONSourceData: string;
    setLayerZoomRange: string;
    setLayerProperty: string;
    setCenter: string;
    setZoom: string;
    setBearing: string;
    setPitch: string;
    setSprite: string;
    setGlyphs: string;
    setTransition: string;
    setLight: string;
};
/**
 * Diff two stylesheet
 *
 * Creates semanticly aware diffs that can easily be applied at runtime.
 * Operations produced by the diff closely resemble the maplibre-gl-js API. Any
 * error creating the diff will fall back to the 'setStyle' operation.
 *
 * Example diff:
 * [
 *     { command: 'setConstant', args: ['@water', '#0000FF'] },
 *     { command: 'setPaintProperty', args: ['background', 'background-color', 'black'] }
 * ]
 *
 * @private
 * @param {*} [before] stylesheet to compare from
 * @param {*} after stylesheet to compare to
 * @returns Array list of changes
 */
declare function diffStyles(before: any, after: any): any[];
export default diffStyles;
export { operations };

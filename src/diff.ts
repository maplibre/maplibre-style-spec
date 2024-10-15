
import {GeoJSONSourceSpecification, LayerSpecification, LightSpecification, ProjectionSpecification, SkySpecification, SourceSpecification, SpriteSpecification, StyleSpecification, TerrainSpecification, TransitionSpecification} from './types.g';
import isEqual from './util/deep_equal';

/**
 * Operations that can be performed by the diff.
 * Below are the operations and their arguments, the arguments should be aligned with the style methods in maplibre-gl-js.
 */
export type DiffOperationsMap = {
    'setStyle': [StyleSpecification];
    'addLayer': [LayerSpecification, string | null];
    'removeLayer': [string];
    'setPaintProperty': [string, string, unknown, string | null];
    'setLayoutProperty': [string, string, unknown, string | null];
    'setFilter': [string, unknown];
    'addSource': [string, SourceSpecification];
    'removeSource': [string];
    'setGeoJSONSourceData': [string, unknown];
    'setLayerZoomRange': [string, number, number];
    'setLayerProperty': [string, string, unknown];
    'setCenter': [number[]];
    'setZoom': [number];
    'setBearing': [number];
    'setPitch': [number];
    'setRoll': [number];
    'setSprite': [SpriteSpecification];
    'setGlyphs': [string];
    'setTransition': [TransitionSpecification];
    'setLight': [LightSpecification];
    'setTerrain': [TerrainSpecification];
    'setSky': [SkySpecification];
    'setProjection': [ProjectionSpecification];
}

export type DiffOperations = keyof DiffOperationsMap;

export type DiffCommand<T extends DiffOperations> = {
    command: T;
    args: DiffOperationsMap[T];
};

/**
 * The main reason for this method is to allow type check when adding a command to the array.
 * @param commands - The commands array to add to
 * @param command - The command to add
 */
function addCommand<T extends DiffOperations>(commands: DiffCommand<DiffOperations>[], command: DiffCommand<T>) {
    commands.push(command);
}

function addSource(sourceId: string, after: {[key: string]: SourceSpecification}, commands: DiffCommand<DiffOperations>[]) {
    addCommand(commands, {command: 'addSource', args: [sourceId, after[sourceId]]});
}

function removeSource(sourceId: string, commands: DiffCommand<DiffOperations>[], sourcesRemoved: {[key: string]: boolean}) {
    addCommand(commands, {command: 'removeSource', args: [sourceId]});
    sourcesRemoved[sourceId] = true;
}

function updateSource(sourceId: string, after: {[key: string]: SourceSpecification}, commands: DiffCommand<DiffOperations>[], sourcesRemoved: {[key: string]: boolean}) {
    removeSource(sourceId, commands, sourcesRemoved);
    addSource(sourceId, after, commands);
}

function canUpdateGeoJSON(before: {[key: string]: SourceSpecification}, after: {[key: string]: SourceSpecification}, sourceId: string) {
    let prop;
    for (prop in before[sourceId]) {
        if (!Object.prototype.hasOwnProperty.call(before[sourceId], prop)) continue;
        if (prop !== 'data' && !isEqual(before[sourceId][prop], after[sourceId][prop])) {
            return false;
        }
    }
    for (prop in after[sourceId]) {
        if (!Object.prototype.hasOwnProperty.call(after[sourceId], prop)) continue;
        if (prop !== 'data' && !isEqual(before[sourceId][prop], after[sourceId][prop])) {
            return false;
        }
    }
    return true;
}

function diffSources(before: {[key: string]: SourceSpecification}, after: {[key: string]: SourceSpecification}, commands: DiffCommand<DiffOperations>[], sourcesRemoved: {[key: string]: boolean}) {
    before = before || {} as {[key: string]: SourceSpecification};
    after = after || {} as {[key: string]: SourceSpecification};

    let sourceId: string;

    // look for sources to remove
    for (sourceId in before) {
        if (!Object.prototype.hasOwnProperty.call(before, sourceId)) continue;
        if (!Object.prototype.hasOwnProperty.call(after, sourceId)) {
            removeSource(sourceId, commands, sourcesRemoved);
        }
    }

    // look for sources to add/update
    for (sourceId in after) {
        if (!Object.prototype.hasOwnProperty.call(after, sourceId)) continue;
        if (!Object.prototype.hasOwnProperty.call(before, sourceId)) {
            addSource(sourceId, after, commands);
        } else if (!isEqual(before[sourceId], after[sourceId])) {
            if (before[sourceId].type === 'geojson' && after[sourceId].type === 'geojson' && canUpdateGeoJSON(before, after, sourceId)) {
                addCommand(commands, {command: 'setGeoJSONSourceData', args: [sourceId, (after[sourceId] as GeoJSONSourceSpecification).data]});
            } else {
                // no update command, must remove then add
                updateSource(sourceId, after, commands, sourcesRemoved);
            }
        }
    }
}

function diffLayerPropertyChanges(before: LayerSpecification['layout'] | LayerSpecification['paint'], after:LayerSpecification['layout'] | LayerSpecification['paint'], commands: DiffCommand<DiffOperations>[], layerId: string, klass: string | null, command: 'setPaintProperty' | 'setLayoutProperty') {
    before = before || {} as LayerSpecification['layout'] | LayerSpecification['paint'];
    after = after || {} as LayerSpecification['layout'] | LayerSpecification['paint'];

    for (const prop in before) {
        if (!Object.prototype.hasOwnProperty.call(before, prop)) continue;
        if (!isEqual(before[prop], after[prop])) {
            commands.push({command, args: [layerId, prop, after[prop], klass]});
        }
    }
    for (const prop in after) {
        if (!Object.prototype.hasOwnProperty.call(after, prop) || Object.prototype.hasOwnProperty.call(before, prop)) continue;
        if (!isEqual(before[prop], after[prop])) {
            commands.push({command, args: [layerId, prop, after[prop], klass]});
        }
    }
}

function pluckId(layer: LayerSpecification) {
    return layer.id;
}
function indexById(group: {[key: string]: LayerSpecification}, layer: LayerSpecification) {
    group[layer.id] = layer;
    return group;
}

function diffLayers(before: LayerSpecification[], after: LayerSpecification[], commands: DiffCommand<DiffOperations>[]) {
    before = before || [];
    after = after || [];

    // order of layers by id
    const beforeOrder = before.map(pluckId);
    const afterOrder = after.map(pluckId);

    // index of layer by id
    const beforeIndex = before.reduce(indexById, {});
    const afterIndex = after.reduce(indexById, {});

    // track order of layers as if they have been mutated
    const tracker = beforeOrder.slice();

    // layers that have been added do not need to be diffed
    const clean = Object.create(null);

    let layerId: string;
    let beforeLayer: LayerSpecification & { source?: string; filter?: unknown};
    let afterLayer: LayerSpecification & { source?: string; filter?: unknown};
    let insertBeforeLayerId: string;
    let prop: string;

    // remove layers
    for (let i = 0, d = 0; i < beforeOrder.length; i++) {
        layerId = beforeOrder[i];
        if (!Object.prototype.hasOwnProperty.call(afterIndex, layerId)) {
            addCommand(commands, {command: 'removeLayer', args: [layerId]});
            tracker.splice(tracker.indexOf(layerId, d), 1);
        } else {
            // limit where in tracker we need to look for a match
            d++;
        }
    }

    // add/reorder layers
    for (let i = 0, d = 0; i < afterOrder.length; i++) {
        // work backwards as insert is before an existing layer
        layerId = afterOrder[afterOrder.length - 1 - i];

        if (tracker[tracker.length - 1 - i] === layerId) continue;

        if (Object.prototype.hasOwnProperty.call(beforeIndex, layerId)) {
            // remove the layer before we insert at the correct position
            addCommand(commands, {command: 'removeLayer', args: [layerId]});
            tracker.splice(tracker.lastIndexOf(layerId, tracker.length - d), 1);
        } else {
            // limit where in tracker we need to look for a match
            d++;
        }

        // add layer at correct position
        insertBeforeLayerId = tracker[tracker.length - i];
        addCommand(commands, {command: 'addLayer', args: [afterIndex[layerId], insertBeforeLayerId]});
        tracker.splice(tracker.length - i, 0, layerId);
        clean[layerId] = true;
    }

    // update layers
    for (let i = 0; i < afterOrder.length; i++) {
        layerId = afterOrder[i];
        beforeLayer = beforeIndex[layerId];
        afterLayer = afterIndex[layerId];

        // no need to update if previously added (new or moved)
        if (clean[layerId] || isEqual(beforeLayer, afterLayer)) continue;

        // If source, source-layer, or type have changes, then remove the layer
        // and add it back 'from scratch'.
        if (!isEqual(beforeLayer.source, afterLayer.source) || !isEqual(beforeLayer['source-layer'], afterLayer['source-layer']) || !isEqual(beforeLayer.type, afterLayer.type)) {
            addCommand(commands, {command: 'removeLayer', args: [layerId]});
            // we add the layer back at the same position it was already in, so
            // there's no need to update the `tracker`
            insertBeforeLayerId = tracker[tracker.lastIndexOf(layerId) + 1];
            addCommand(commands, {command: 'addLayer', args: [afterLayer, insertBeforeLayerId]});
            continue;
        }

        // layout, paint, filter, minzoom, maxzoom
        diffLayerPropertyChanges(beforeLayer.layout, afterLayer.layout, commands, layerId, null, 'setLayoutProperty');
        diffLayerPropertyChanges(beforeLayer.paint, afterLayer.paint, commands, layerId, null, 'setPaintProperty');
        if (!isEqual(beforeLayer.filter, afterLayer.filter)) {
            addCommand(commands, {command: 'setFilter', args: [layerId, afterLayer.filter]});
        }
        if (!isEqual(beforeLayer.minzoom, afterLayer.minzoom) || !isEqual(beforeLayer.maxzoom, afterLayer.maxzoom)) {
            addCommand(commands, {command: 'setLayerZoomRange', args: [layerId, afterLayer.minzoom, afterLayer.maxzoom]});
        }

        // handle all other layer props, including paint.*
        for (prop in beforeLayer) {
            if (!Object.prototype.hasOwnProperty.call(beforeLayer, prop)) continue;
            if (prop === 'layout' || prop === 'paint' || prop === 'filter' ||
                prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom') continue;
            if (prop.indexOf('paint.') === 0) {
                diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), 'setPaintProperty');
            } else if (!isEqual(beforeLayer[prop], afterLayer[prop])) {
                addCommand(commands, {command: 'setLayerProperty', args: [layerId, prop, afterLayer[prop]]});
            }
        }
        for (prop in afterLayer) {
            if (!Object.prototype.hasOwnProperty.call(afterLayer, prop) || Object.prototype.hasOwnProperty.call(beforeLayer, prop)) continue;
            if (prop === 'layout' || prop === 'paint' || prop === 'filter' ||
                prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom') continue;
            if (prop.indexOf('paint.') === 0) {
                diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), 'setPaintProperty');
            } else if (!isEqual(beforeLayer[prop], afterLayer[prop])) {
                addCommand(commands, {command: 'setLayerProperty', args: [layerId, prop, afterLayer[prop]]});
            }
        }
    }
}

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
function diffStyles(before: StyleSpecification, after: StyleSpecification): DiffCommand<DiffOperations>[] {
    if (!before) return [{command: 'setStyle', args: [after]}];

    let commands: DiffCommand<DiffOperations>[] = [];

    try {
        // Handle changes to top-level properties
        if (!isEqual(before.version, after.version)) {
            return [{command: 'setStyle', args: [after]}];
        }
        if (!isEqual(before.center, after.center)) {
            commands.push({command: 'setCenter', args: [after.center]});
        }
        if (!isEqual(before.zoom, after.zoom)) {
            commands.push({command: 'setZoom', args: [after.zoom]});
        }
        if (!isEqual(before.bearing, after.bearing)) {
            commands.push({command: 'setBearing', args: [after.bearing]});
        }
        if (!isEqual(before.pitch, after.pitch)) {
            commands.push({command: 'setPitch', args: [after.pitch]});
        }
        if (!isEqual(before.roll, after.roll)) {
            commands.push({command: 'setRoll', args: [after.roll]});
        }
        if (!isEqual(before.sprite, after.sprite)) {
            commands.push({command: 'setSprite', args: [after.sprite]});
        }
        if (!isEqual(before.glyphs, after.glyphs)) {
            commands.push({command: 'setGlyphs', args: [after.glyphs]});
        }
        if (!isEqual(before.transition, after.transition)) {
            commands.push({command: 'setTransition', args: [after.transition]});
        }
        if (!isEqual(before.light, after.light)) {
            commands.push({command: 'setLight', args: [after.light]});
        }
        if (!isEqual(before.terrain, after.terrain)) {
            commands.push({command: 'setTerrain', args: [after.terrain]});
        }
        if (!isEqual(before.sky, after.sky)) {
            commands.push({command: 'setSky', args: [after.sky]});
        }
        if (!isEqual(before.projection, after.projection)) {
            commands.push({command: 'setProjection', args: [after.projection]});
        }

        // Handle changes to `sources`
        // If a source is to be removed, we also--before the removeSource
        // command--need to remove all the style layers that depend on it.
        const sourcesRemoved = {};

        // First collect the {add,remove}Source commands
        const removeOrAddSourceCommands = [];
        diffSources(before.sources, after.sources, removeOrAddSourceCommands, sourcesRemoved);

        // Push a removeLayer command for each style layer that depends on a
        // source that's being removed.
        // Also, exclude any such layers them from the input to `diffLayers`
        // below, so that diffLayers produces the appropriate `addLayers`
        // command
        const beforeLayers = [];
        if (before.layers) {
            before.layers.forEach((layer) => {
                if ('source' in layer && sourcesRemoved[layer.source]) {
                    commands.push({command: 'removeLayer', args: [layer.id]});
                } else {
                    beforeLayers.push(layer);
                }
            });
        }
        commands = commands.concat(removeOrAddSourceCommands);

        // Handle changes to `layers`
        diffLayers(beforeLayers, after.layers, commands);

    } catch (e) {
        // fall back to setStyle
        console.warn('Unable to compute style diff:', e);
        commands = [{command: 'setStyle', args: [after]}];
    }

    return commands;
}

export default diffStyles;

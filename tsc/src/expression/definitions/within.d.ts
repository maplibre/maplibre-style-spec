import type { Type } from '../types';
import type { Expression } from '../expression';
import type ParsingContext from '../parsing_context';
import type EvaluationContext from '../evaluation_context';
type GeoJSONPolygons = GeoJSON.Polygon | GeoJSON.MultiPolygon;
declare class Within implements Expression {
    type: Type;
    geojson: GeoJSON.GeoJSON;
    geometries: GeoJSONPolygons;
    constructor(geojson: GeoJSON.GeoJSON, geometries: GeoJSONPolygons);
    static parse(args: ReadonlyArray<unknown>, context: ParsingContext): Expression;
    evaluate(ctx: EvaluationContext): boolean;
    eachChild(): void;
    outputDefined(): boolean;
}
export default Within;

import ValidationError from '../error/validation_error';
import type { StyleSpecification, TerrainSpecification } from '../types.g';
import v8 from '../reference/v8.json';
export default function validateTerrain(options: {
    value: TerrainSpecification;
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}): ValidationError[];

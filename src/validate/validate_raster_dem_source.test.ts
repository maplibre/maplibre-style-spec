import validateSpec from './validate';
import v8 from '../reference/v8.json' with {type: 'json'};
import validateRasterDEMSource from './validate_raster_dem_source';
import {RasterDEMSourceSpecification} from '../types.g';

function checkErrorMessage(message: string, key: string, expectedType: string, foundType: string) {
    expect(message).toContain(key);
    expect(message).toContain(expectedType);
    expect(message).toContain(foundType);
}

describe('Validate source_raster_dem', () => {
    test('Should pass when value is undefined', () => {
        const errors = validateRasterDEMSource({validateSpec, value: undefined, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should return error when value is not an object', () => {
        const errors = validateRasterDEMSource({validateSpec, value: '' as unknown as RasterDEMSourceSpecification, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('object');
        expect(errors[0].message).toContain('expected');
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {a: 1} as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('a');
        expect(errors[0].message).toContain('unknown');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {type: 'raster-dem', url: {} as any, tiles: {} as any, encoding: 'foo' as any}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(3);
        checkErrorMessage(errors[0].message, 'url', 'string', 'object');
        checkErrorMessage(errors[1].message, 'tiles', 'array', 'object');
        checkErrorMessage(errors[2].message, 'encoding', '[terrarium, mapbox, custom]', 'foo');
    });

    test('Should return errors when custom encoding values are set but encoding is "mapbox"', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {type: 'raster-dem', encoding: 'mapbox', 'redFactor': 1.0, 'greenFactor': 1.0, 'blueFactor': 1.0, 'baseShift': 1.0}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(4);
        checkErrorMessage(errors[0].message, 'redFactor', 'custom', 'mapbox');
        checkErrorMessage(errors[1].message, 'greenFactor', 'custom', 'mapbox');
        checkErrorMessage(errors[2].message, 'blueFactor', 'custom', 'mapbox');
        checkErrorMessage(errors[3].message, 'baseShift', 'custom', 'mapbox');
    });

    test('Should return errors when custom encoding values are set but encoding is "terrarium"', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {type: 'raster-dem', encoding: 'terrarium', 'redFactor': 1.0, 'greenFactor': 1.0, 'blueFactor': 1.0, 'baseShift': 1.0}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(4);
        checkErrorMessage(errors[0].message, 'redFactor', 'custom', 'terrarium');
        checkErrorMessage(errors[1].message, 'greenFactor', 'custom', 'terrarium');
        checkErrorMessage(errors[2].message, 'blueFactor', 'custom', 'terrarium');
        checkErrorMessage(errors[3].message, 'baseShift', 'custom', 'terrarium');
    });

    test('Should pass when custom encoding values are set and encoding is "custom"', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {type: 'raster-dem', encoding: 'custom', 'redFactor': 1.0, 'greenFactor': 1.0, 'blueFactor': 1.0, 'baseShift': 1.0}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should pass if everything is according to spec', () => {
        const errors = validateRasterDEMSource({validateSpec, value: {type: 'raster-dem'}, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });
});

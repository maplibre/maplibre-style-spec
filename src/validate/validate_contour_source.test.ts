import validateSpec from './validate';
import v8 from '../reference/v8.json' assert {type: 'json'};
import validateContourSource from './validate_contour_source';
import {ContourSourceSpecification, StyleSpecification} from '../types.g';

function checkErrorMessage(message: string, key: string, expectedType: string, foundType: string) {
    expect(message).toContain(key);
    expect(message).toContain(expectedType);
    expect(message).toContain(foundType);
}

describe('Validate source_contour', () => {
    test('Should pass when value is undefined', () => {
        const errors = validateContourSource({validateSpec, value: undefined, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(0);
    });

    test('Should return error when value is not an object', () => {
        const errors = validateContourSource({validateSpec, value: '' as unknown as ContourSourceSpecification, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toContain('object');
        expect(errors[0].message).toContain('expected');
    });

    test('Should return error in case of unknown property', () => {
        const errors = validateContourSource({validateSpec, value: {a: 1} as any, styleSpec: v8, style: {} as any});
        expect(errors).toHaveLength(2);
        expect(errors[1].message).toContain('a');
        expect(errors[1].message).toContain('unknown');
    });

    test('Should return errors according to spec violations', () => {
        const errors = validateContourSource({
            validateSpec,
            value: {type: 'contour', source: {} as any, unit: 'garbage' as any, intervals: {} as any, majorMultiplier: {} as any, maxzoom: '1' as any, minzoom: '2' as any, overzoom: '3' as any}, styleSpec: v8, style: {} as any,
            sourceName: 'contour-source'
        });
        expect(errors).toHaveLength(8);
        checkErrorMessage(errors[0].message, 'source', 'raster-dem', 'contour-source');
        checkErrorMessage(errors[1].message, 'source', 'string', 'object');
        checkErrorMessage(errors[2].message, 'unit', '[meters, feet] or number', 'garbage');
        checkErrorMessage(errors[3].message, 'intervals', 'array', 'object');
        checkErrorMessage(errors[4].message, 'majorMultiplier', 'array', 'object');
        checkErrorMessage(errors[5].message, 'maxzoom', 'number', 'string');
        checkErrorMessage(errors[6].message, 'minzoom', 'number', 'string');
        checkErrorMessage(errors[7].message, 'overzoom', 'number', 'string');
    });

    test('Should return errors if interval or major definitions are malformed', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            unit: 1.5,
            intervals: [500, 12],
            majorMultiplier: [5, 12, 4, 11, 9]
        };
        const style: StyleSpecification = {
            sources: {
                dem: {
                    type: 'raster-dem',
                    maxzoom: 11
                },
                contour
            },
            version: 8,
            layers: []
        };
        const errors = validateContourSource({
            validateSpec,
            value: contour,
            styleSpec: v8,
            style
        });
        expect(errors).toHaveLength(2);
        checkErrorMessage(errors[0].message, 'intervals', 'odd', '2');
        checkErrorMessage(errors[1].message, 'majorMultiplier', 'strictly', 'ascending');
    });

    test('Should return errors when source is missing', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            unit: 'feet',
        };
        const style: StyleSpecification = {
            sources: {
                contour
            },
            version: 8,
            layers: []
        };
        const errors = validateContourSource({
            validateSpec,
            value: contour,
            styleSpec: v8,
            style,
            sourceName: 'contour'
        });
        expect(errors).toHaveLength(1);
        checkErrorMessage(errors[0].message, 'source', 'raster-dem', 'contour');
    });

    test('Should return errors when source has wrong type', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            unit: 'feet',
        };
        const style: StyleSpecification = {
            sources: {
                dem: {
                    type: 'raster',
                    maxzoom: 11
                },
                contour
            },
            version: 8,
            layers: []
        };
        const errors = validateContourSource({
            validateSpec,
            value: contour,
            styleSpec: v8,
            style,
            sourceName: 'contour'
        });
        expect(errors).toHaveLength(1);
        checkErrorMessage(errors[0].message, 'source', 'raster-dem', 'contour');
    });

    test('Should pass if everything is according to spec', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            intervals: [500],
            majorMultiplier: [5, 12, 4],
            maxzoom: 16,
            minzoom: 4,
            overzoom: 2,
            unit: 'feet',
        };
        const style: StyleSpecification = {
            sources: {
                dem: {
                    type: 'raster-dem',
                    maxzoom: 11
                },
                contour
            },
            version: 8,
            layers: []
        };
        const errors = validateContourSource({
            validateSpec,
            value: contour,
            styleSpec: v8,
            style
        });
        expect(errors).toHaveLength(0);
    });

    test('Should pass if everything is according to spec using numeric unit', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            unit: 1.5,
        };
        const style: StyleSpecification = {
            sources: {
                dem: {
                    type: 'raster-dem',
                    maxzoom: 11
                },
                contour
            },
            version: 8,
            layers: []
        };
        const errors = validateContourSource({
            validateSpec,
            value: contour,
            styleSpec: v8,
            style
        });
        expect(errors).toHaveLength(0);
    });
});

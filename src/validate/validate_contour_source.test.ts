import validateSpec from './validate';
import v8 from '../reference/v8.json' assert {type: 'json'};
import validateContourSource from './validate_contour_source';
import {ContourSourceSpecification, PropertyValueSpecification, StyleSpecification} from '../types.g';

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
            value: {type: 'contour', source: {} as any, unit: 'garbage' as any, intervals: {} as any, majorMultiplier: {} as any, overzoom: '3' as any}, styleSpec: v8, style: {} as any,
            sourceName: 'contour-source'
        });
        expect(errors).toHaveLength(6);
        checkErrorMessage(errors[0].message, 'source', 'raster-dem', 'contour-source');
        checkErrorMessage(errors[1].message, 'source', 'string', 'object');
        checkErrorMessage(errors[2].message, 'unit', '[meters, feet] or number', 'garbage');
        checkErrorMessage(errors[3].message, 'intervals', 'literal', 'Bare object');
        checkErrorMessage(errors[4].message, 'majorMultiplier', 'literal', 'Bare object');
        checkErrorMessage(errors[5].message, 'overzoom', 'number', 'string');
    });

    test('Should return errors if interval or major definitions are malformed', () => {
        const contour: ContourSourceSpecification = {
            type: 'contour',
            source: 'dem',
            unit: 1.5,
            intervals: ['step', ['zoom'], 1, 10],
            majorMultiplier: ['step', ['zoom'], 1, 10, 3, 9, 4]
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
        checkErrorMessage(errors[0].message, 'intervals', 'at least 4 arguments', 'only 3');
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
                    type: 'raster'
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
            intervals: ['step', ['zoom'], 5, 10, 3],
            majorMultiplier: 500,
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

    const goodExpressions: Array<PropertyValueSpecification<number>> = [
        5,
        ['step', ['zoom'], 100, 10, 50],
        ['interpolate', ['linear'], ['zoom'], 1, 5, 10, 10],
        ['*', ['zoom'], 10],
        ['*', 2, 3],
    ];

    for (const expr of goodExpressions) {
        test(`Expression should be allowed: ${JSON.stringify(expr)}`, () => {
            const contour: ContourSourceSpecification = {
                type: 'contour',
                source: 'dem',
                intervals: expr,
                majorMultiplier: expr,
            };
            const style: StyleSpecification = {
                sources: {
                    dem: {
                        type: 'raster-dem'
                    },
                    contour
                },
                version: 8,
                layers: []
            };
            expect(validateContourSource({
                validateSpec,
                value: contour,
                styleSpec: v8,
                style
            })).toHaveLength(0);
        });
    }

    const badExpressions: Array<PropertyValueSpecification<number>> = [
        ['geometry-type'],
        ['get', 'x'],
        ['interpolate', ['linear'], ['get', 'prop'], 1, 5, 10, 10],
        ['feature-state', 'key'],
        ['step', ['zoom'], 100, 10, ['get', 'value']],
    ];

    for (const expr of badExpressions) {
        test(`Expression should not be allowed: ${JSON.stringify(expr)}`, () => {
            const contour: ContourSourceSpecification = {
                type: 'contour',
                source: 'dem',
                intervals: expr,
                majorMultiplier: expr,
            };
            const style: StyleSpecification = {
                sources: {
                    dem: {
                        type: 'raster-dem'
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
            checkErrorMessage(errors[0].message, 'intervals', '\"zoom\"-based expressions', 'contour source expressions');
            checkErrorMessage(errors[1].message, 'majorMultiplier', '\"zoom\"-based expressions', 'contour source expressions');
        });
    }
});

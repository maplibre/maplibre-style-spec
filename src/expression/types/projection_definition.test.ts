import {ProjectionDefinition} from './projection_definition';

describe('Projection class', () => {
    test('should parse projection with multiple inputs', () => {
        const projection = ProjectionDefinition.parse(['mercator', 'vertical-perspective', 0.5]);
        expect(projection.from).toBe('mercator');
        expect(projection.to).toBe('vertical-perspective');
        expect(projection.transition).toBe(0.5);
    });

    test('should parse projection with single input', () => {
        const projection = ProjectionDefinition.parse('mercator');
        expect(projection.from).toBe('mercator');
        expect(projection.to).toBe('mercator');
        expect(projection.transition).toBe(1);
    });

    test('should return undefined when input is not an array or string', () => {
        const projection = ProjectionDefinition.parse({} as any);
        expect(projection).toBeUndefined();
    });

    test('should return undefined when input is an array with length not equal to 3', () => {
        const projection = ProjectionDefinition.parse(['mercator', 'vertical-perspective'] as any);
        expect(projection).toBeUndefined();
    });

    test('should return undefined when input is an array with non-string and non-number elements', () => {
        const projection = ProjectionDefinition.parse([1, 2, 3] as any);
        expect(projection).toBeUndefined();
    });

    test('should interpolate projections', () => {
        const projection = ProjectionDefinition.interpolate('mercator', 'vertical-perspective', 0.5);
        expect(projection.from).toBe('mercator');
        expect(projection.to).toBe('vertical-perspective');
        expect(projection.transition).toBe(0.5);
    });

    test('should parse projection object', () => {
        const projection = ProjectionDefinition.parse({from: 'mercator', to: 'vertical-perspective', transition: 0.5});
        expect(projection.from).toBe('mercator');
        expect(projection.to).toBe('vertical-perspective');
        expect(projection.transition).toBe(0.5);
    });

    test('should serialize projection', () => {
        const projection = ProjectionDefinition.parse(['mercator', 'vertical-perspective', 0.5]);
        expect(JSON.stringify(projection)).toBe('{\"from\":\"mercator\",\"to\":\"vertical-perspective\",\"transition\":0.5}');
    });
});

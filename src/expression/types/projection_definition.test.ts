import {ProjectionDefinition} from './projection_definition';

describe('Projection class', () => {

    test('should serialize projection, with [from, to, transition]', () => {
        expect(`${new ProjectionDefinition('mercator', 'vertical-perspective', 1)}`).toBe('["mercator", "vertical-perspective", 1]');
        expect(`${new ProjectionDefinition('vertical-perspective', 'mercator', 0.3)}`).toBe('["vertical-perspective", "mercator", 0.3]');
    });
});

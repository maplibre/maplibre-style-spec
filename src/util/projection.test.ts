import {ProjectionTransition} from './projection';

describe('Projection class', () => {

    test('should serialize to rgba format', () => {
        expect(`${new ProjectionTransition('mercator', 'stereographic', 1)}`).toBe('["mercator", "stereographic", 1]');
        expect(`${new ProjectionTransition('stereographic', 'mercator', 0.3)}`).toBe('["stereographic", "mercator", 0.3]');
    });
});

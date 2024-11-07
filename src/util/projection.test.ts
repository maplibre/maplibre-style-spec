import {Projection} from './projection';

describe('Projection class', () => {

    test('should serialize to rgba format', () => {
        expect(`${new Projection('mercator', 'stereographic', 1)}`).toBe('["mercator", "stereographic", 1]');
        expect(`${new Projection('stereographic', 'mercator', 0.3)}`).toBe('["stereographic", "mercator", 0.3]');
    });
});

import {Projection} from './projection';

describe('Projection class', () => {

    test('should serialize to rgba format', () => {
        expect(`${new Projection('mercator', 'general-perspective', 1)}`).toBe('["mercator", "general-perspective", 1]');
        expect(`${new Projection('general-perspective', 'mercator', 0.3)}`).toBe('["general-perspective", "mercator", 0.3]');
    });
});

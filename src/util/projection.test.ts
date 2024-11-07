import {Projection} from './projection';

describe('Projection class', () => {

    test('should serialize to rgba format', () => {
        expect(`${new Projection('mercator', 'globe', 1)}`).toBe('["mercator", "globe", 1]');
        expect(`${new Projection('globe', 'mercator', 0.3)}`).toBe('["globe", "mercator", 0.3]');
    });
});

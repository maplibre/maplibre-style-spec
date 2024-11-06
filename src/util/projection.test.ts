import {Projection} from './projection';

describe('Projection class', () => {

    test('should serialize to rgba format', () => {
        expect(`${new Projection('mercator', 'globe', 1)}`).toBe('["mercator", "globe", 1]');
        expect(`${new Projection('globe', 'mercator', 0.3)}`).toBe('["globe", "mercator", 0.3]');
        expect(`${Projection.parse('globe')}`).toBe('["globe", "globe", 1]');
        expect(`${Projection.parse('mercator')}`).toBe('["mercator", "mercator", 1]');
    });
});

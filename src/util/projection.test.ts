import {Projection} from './projection';

describe('Projection class', () => {

    test('should serialize projection, with [from, to, transition]', () => {
        expect(`${new Projection('mercator', 'vertical-perspective', 1)}`).toBe('["mercator", "vertical-perspective", 1]');
        expect(`${new Projection('vertical-perspective', 'mercator', 0.3)}`).toBe('["vertical-perspective", "mercator", 0.3]');
    });
});

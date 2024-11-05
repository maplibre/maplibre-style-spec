import {Projection, ProjectionTransition} from './projection';

const Globe = new Projection('globe');
const Mercator = new Projection('mercator');

describe('Projection class', () => {
    test('should serialize transition to string format', () => {
        expect(`${new ProjectionTransition(Mercator, Globe, 0.2)}`).toBe('["mercator", "globe", 0.2]');
        expect(`${new ProjectionTransition(Globe, Mercator, 0.1)}`).toBe('["globe", "mercator", 0.1]'); 
    });
    
    test('should serialize single projection to string format', () => {
        expect(Mercator.toString()).toBe('mercator');
        expect(Globe.toString()).toBe('globe');
    });

});

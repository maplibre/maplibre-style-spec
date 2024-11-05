import {Projection} from './projection';

enum Proj {
    Mercator = 'mercator',
    Globe = 'globe'
}

describe('Projection class', () => {
    test('should serialize transition to string format', () => {
        expect(`${new Projection({from: Proj.Mercator, to: Proj.Globe, interpolation: 0.2})}`).toBe('["mercator-to-globe", 0.2]');
        expect(`${new Projection({from: Proj.Globe, to: Proj.Mercator, interpolation: 0.1})}`).toBe('["globe-to-mercator", 0.1]'); 
    });
    
    test('should serialize single projection to string format', () => {
        expect(`${new Projection({projection: Proj.Mercator})}`).toBe('["mercator", 1]');
        expect(`${new Projection({projection: Proj.Globe})}`).toBe('["globe", 1]');
    });

});

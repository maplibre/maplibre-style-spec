import {makeProjection, Projection} from './projection';

const Globe = makeProjection('globe');
const Mercator = makeProjection('mercator');

describe('Projection class', () => {
    test('should serialize transition to string format', () => {
        expect(new Projection(Mercator, Globe, 0.2)).toEqual(({'from': {'from': 'mercator', 'to': 'mercator', 'transition': 1}, 'to': {'from': 'globe', 'to': 'globe', 'transition': 1}, 'transition': 0.2}));
        expect(new Projection(Globe, Mercator, 0.1)).toEqual(({'from': {'from': 'globe', 'to': 'globe', 'transition': 1}, 'to': {'from': 'mercator', 'to': 'mercator', 'transition': 1}, 'transition': 0.1})); 
    });
    
    test('should serialize single projection to string format', () => {
        expect(Mercator).toEqual({'from': 'mercator', 'to': 'mercator', 'transition': 1});
        expect(Globe).toEqual({'from': 'globe', 'to': 'globe', 'transition': 1});
    });

});

import {makeProjection, Projection} from './projection';

const Globe = 'globe';
const Mercator = 'mercator';

describe('Projection class', () => {
    test('should serialize transition to string format', () => {
        expect(new Projection(Globe, Mercator, 0.2)).toEqual(({'from': 'globe', 'to': 'mercator', 'transition': 0.2}));
        expect(new Projection(Mercator, Globe, 0.1)).toEqual(({'from': 'mercator', 'to': 'globe', 'transition': 0.1})); 
    });

});

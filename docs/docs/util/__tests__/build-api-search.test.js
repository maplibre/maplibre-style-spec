import { buildApiSearch } from '../build-api-search';

describe('buildApiSearch', () => {
    buildApiSearch().forEach((item) => {
        it(`${item.name} has required keys`, () => {
            expect(item.name).toBeDefined();
            expect(item.namespace).toBeDefined();
            expect(item.description).toBeDefined();
            expect(item.path).toBeDefined();
        });
    });
});

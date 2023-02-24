import { searchMembers } from '../search-members';
import api from '../../components/api.json';

describe('searchMembers', () => {
    it('simple example', () => {
        expect(
            searchMembers([{ name: 'cool' }, { name: 'beans' }], 'coo')
        ).toEqual([{ name: 'cool' }]);
    });

    it('returns empty array when array or search is missing or invalid', () => {
        expect(searchMembers([{ name: 'cool' }, { name: 'beans' }])).toEqual(
            []
        );
        expect(searchMembers([], 'cool')).toEqual([]);
        expect(searchMembers(undefined, 'cool')).toEqual([]);
        expect(searchMembers({ items: 'beans' }, 'cool')).toEqual([]);
    });

    it('finds matches in `name`', () => {
        expect(
            searchMembers(api[0].members.static[0].members.events, 'drag')
                .length
        ).toEqual(6);
    });
    it('finds matches in `description`', () => {
        expect(
            searchMembers(
                api[0].members.static[0].members.events,
                'interaction'
            ).length
        ).toEqual(6);
    });
});

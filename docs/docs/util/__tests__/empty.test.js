import empty from '../empty';

it('empty', () => {
    expect(empty()).toBe(true);
    expect(empty(['an', 'array'])).toBe(false);
    expect(empty('a string')).toBe(false);
    expect(empty({ an: 'object' })).toBe(false);
});

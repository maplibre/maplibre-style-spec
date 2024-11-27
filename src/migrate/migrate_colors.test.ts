import {migrateColors} from './migrate_colors';

describe('migrate colors', () => {

    test('should convert hsl to a format compliant with CSS Color specification', () => {
        expect(migrateColors('hsla(0, 0, 0, 0)')).toBe('hsla(0,0%,0%,0)');
        expect(migrateColors('hsl(900, 0.15, 90%)')).toBe('hsl(900,15%,90%)');
        expect(migrateColors('hsla(900, .15, .9)')).toBe('hsl(900,15%,90%)');
        expect(migrateColors('hsl(900, 15%, 90%)')).toBe('hsl(900,15%,90%)');
        expect(migrateColors('hsla(900, 15%, 90%)')).toBe('hsl(900,15%,90%)');
        expect(migrateColors('hsla(900, 15%, 90%, 1)')).toBe('hsla(900,15%,90%,1)');
        expect(migrateColors([
            'interpolate', ['linear'], ['zoom'],
            0, 'hsla(900,0.85,0.05,0)',
            10, 'hsla(900, .20, .0155, 1)',
        ])).toEqual([
            'interpolate', ['linear'], ['zoom'],
            0, 'hsla(900,85%,5%,0)',
            10, 'hsla(900,20%,1.55%,1)',
        ]);
        expect(migrateColors('hsl(9001590)')).toBe('hsl(9001590)'); // invalid - no changes
    });

});

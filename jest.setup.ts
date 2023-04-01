import '@jest/globals';
import Color from './src/util/color';

expect.extend({
    toMatchColor(actual: unknown, expectedSerialized: string, precision = 5) {
        const [r, g, b, a] = expectedSerialized.match(/^rgb\(([\d.]+)% ([\d.]+)% ([\d.]+)% \/ ([\d.]+)\)$/).slice(1).map(Number);
        const expected = expect.objectContaining({
            r: expect.closeTo(r / 100 * (a !== 0 ? a : 1), precision),
            g: expect.closeTo(g / 100 * (a !== 0 ? a : 1), precision),
            b: expect.closeTo(b / 100 * (a !== 0 ? a : 1), precision),
            a: expect.closeTo(a, 4),
        });
        const pass = (actual instanceof Color) && this.equals(actual, expected);
        return {
            pass,
            message: () => `${this.utils.matcherHint('toMatchColor', this.utils.printReceived(actual), expectedSerialized)}\n\n${this.utils.diff(expected, actual)}`,
        };
    },
});

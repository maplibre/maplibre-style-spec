import Color from './src/util/color';

expect.extend({

    toMatchColor(received: unknown, expectedSerialized: string, numDigits = 5) {
        const [r, g, b, a] = expectedSerialized.match(/^rgb\(([\d.]+)% ([\d.]+)% ([\d.]+)% \/ ([\d.]+)\)$/).slice(1).map(Number);
        const expected = expect.objectContaining({
            r: expect.closeTo(r / 100 * a, numDigits),
            g: expect.closeTo(g / 100 * a, numDigits),
            b: expect.closeTo(b / 100 * a, numDigits),
            a: expect.closeTo(a, 4),
        });
        const pass = (received instanceof Color) && this.equals(received, expected);
        return {
            pass,
            message: () => `${this.utils.matcherHint('toMatchColor', this.utils.printReceived(received), expectedSerialized)}\n\n${this.utils.diff(expected, received)}`,
        };
    },

    closeToNumberArray(received: unknown, expectedArray: number[], numDigits = 5) {
        const expected = expectedArray.map(n => isNaN(n) ? n : expect.closeTo(n, numDigits));
        const pass = this.equals(received, expected);
        return {
            pass,
            message: () => `${this.utils.matcherHint('closeToNumberArray', this.utils.printReceived(received), this.utils.printExpected(expectedArray))}\n\n${this.utils.diff(expected, received)}`,
        };
    },

});

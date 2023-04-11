import Color from '../../src/util/color';

/**
 * @param toTest Color instance to test
 * @param expectedSerialized color serialized as string in format 'rgb(r% g% b% / alpha)'
 * @param numDigits `expect.closeTo` numDigits parameter
 */
export function expectToMatchColor(toTest: Color, expectedSerialized: string, numDigits = 5) {
    const [r, g, b, a] = expectedSerialized.match(/^rgb\(([\d.]+)% ([\d.]+)% ([\d.]+)% \/ ([\d.]+)\)$/).slice(1).map(Number);
    expect(toTest).toBeInstanceOf(Color);
    expect(toTest).toMatchObject({
        r: expect.closeTo(r / 100 * (a !== 0 ? a : 1), numDigits),
        g: expect.closeTo(g / 100 * (a !== 0 ? a : 1), numDigits),
        b: expect.closeTo(b / 100 * (a !== 0 ? a : 1), numDigits),
        a: expect.closeTo(a, 4),
    });
}

/**
 * `expect.closeTo` but for number array
 *
 * @param toTest number array to test
 * @param expected expected array values
 * @param numDigits `expect.closeTo` numDigits parameter
 */
export function expectCloseToArray(toTest: number[], expected: number[], numDigits = 5) {
    expect(toTest).toEqual(expected.map(n => isNaN(n) ? n : expect.closeTo(n, numDigits)));
}

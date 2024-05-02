import compactStringify from 'json-stringify-pretty-compact';
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

// we have to handle this edge case here because we have test fixtures for this
// edge case, and we don't want UPDATE=1 to mess with them
export function stringify(v) {
    let s = compactStringify(v);

    if (s.indexOf('\u2028') >= 0) {
        s = s.replace(/\u2028/g, '\\u2028');
    }
    if (s.indexOf('\u2029') >= 0) {
        s = s.replace(/\u2029/g, '\\u2029');
    }
    return s;
}

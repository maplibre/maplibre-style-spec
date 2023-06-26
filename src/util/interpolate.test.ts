import {expectToMatchColor} from '../../test/unit/test_utils';
import interpolate, {isSupportedInterpolationColorSpace} from './interpolate';
import Color from './color';
import Padding from './padding';
import VariableAnchorOffsetCollection from './variable_anchor_offset_collection';

describe('interpolate', () => {

    test('interpolate number', () => {
        expect(interpolate.number(-5, 5, 0.00)).toBe(-5.0);
        expect(interpolate.number(-5, 5, 0.25)).toBe(-2.5);
        expect(interpolate.number(-5, 5, 0.50)).toBe(0);
        expect(interpolate.number(-5, 5, 0.75)).toBe(2.5);
        expect(interpolate.number(-5, 5, 1.00)).toBe(5.0);

        expect(interpolate.number(0, 1, 0.5)).toBe(0.5);
        expect(interpolate.number(-10, -5, 0.5)).toBe(-7.5);
        expect(interpolate.number(5, 10, 0.5)).toBe(7.5);
    });

    describe('interpolation color space', () => {

        test('should recognize supported interpolation color spaces', () => {
            expect(isSupportedInterpolationColorSpace('rgb')).toBe(true);
            expect(isSupportedInterpolationColorSpace('hcl')).toBe(true);
            expect(isSupportedInterpolationColorSpace('lab')).toBe(true);
        });

        test('should ignore invalid interpolation color spaces', () => {
            expect(isSupportedInterpolationColorSpace('sRGB')).toBe(false);
            expect(isSupportedInterpolationColorSpace('HCL')).toBe(false);
            expect(isSupportedInterpolationColorSpace('LCH')).toBe(false);
            expect(isSupportedInterpolationColorSpace('LAB')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate-hcl')).toBe(false);
            expect(isSupportedInterpolationColorSpace('interpolate-lab')).toBe(false);
        });

    });

    describe('interpolate color', () => {

        test('should interpolate colors in "rgb" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'rgb');
            expectToMatchColor(i11nFn(0.00), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 25% 75% / 0.9)');
            expectToMatchColor(i11nFn(0.50), 'rgb(0% 50% 50% / 0.8)');
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 75% 25% / 0.7)');
            expectToMatchColor(i11nFn(1.00), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "hcl" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'hcl');
            expectToMatchColor(i11nFn(0.00), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 49.37% 100% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.50), 'rgb(0% 70.44% 100% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 87.54% 63.18% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.00), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should interpolate colors in "lab" color space', () => {
            const color = Color.parse('rgba(0,0,255,1)');
            const targetColor = Color.parse('rgba(0,255,0,.6)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'lab');
            expectToMatchColor(i11nFn(0.00), 'rgb(0% 0% 100% / 1)');
            expectToMatchColor(i11nFn(0.25), 'rgb(39.64% 34.55% 83.36% / 0.9)', 4);
            expectToMatchColor(i11nFn(0.50), 'rgb(46.42% 56.82% 65.91% / 0.8)', 4);
            expectToMatchColor(i11nFn(0.75), 'rgb(41.45% 78.34% 45.62% / 0.7)', 4);
            expectToMatchColor(i11nFn(1.00), 'rgb(0% 100% 0% / 0.6)');
        });

        test('should correctly interpolate colors with alpha=0', () => {
            const color = Color.parse('rgba(0,0,255,0)');
            const targetColor = Color.parse('rgba(0,255,0,1)');

            const i11nFn = (t: number) => interpolate.color(color, targetColor, t, 'rgb');
            expectToMatchColor(i11nFn(0.00), 'rgb(0% 0% 0% / 0)');
            expectToMatchColor(i11nFn(0.25), 'rgb(0% 25% 75% / 0.25)');
            expectToMatchColor(i11nFn(0.50), 'rgb(0% 50% 50% / 0.5)');
            expectToMatchColor(i11nFn(0.75), 'rgb(0% 75% 25% / 0.75)');
            expectToMatchColor(i11nFn(1.00), 'rgb(0% 100% 0% / 1)');
        });

        test('should limit interpolation results to sRGB gamut', () => {
            const color = Color.parse('royalblue');
            const targetColor = Color.parse('cyan');

            for (const space of ['rgb', 'hcl', 'lab'] as const) {
                const i11nFn = (t: number) => interpolate.color(color, targetColor, t, space);
                const colorInBetween = i11nFn(0.5);
                for (const key of ['r', 'g', 'b', 'a'] as const) {
                    expect(colorInBetween[ key ]).toBeGreaterThanOrEqual(0);
                    expect(colorInBetween[ key ]).toBeLessThanOrEqual(1);
                }
            }
        });

    });

    test('interpolate array', () => {
        expect(interpolate.array([0, 0, 0, 0], [1, 2, 3, 4], 0.5)).toEqual([0.5, 1, 3 / 2, 2]);
    });

    test('interpolate padding', () => {
        const padding = new Padding([0, 0, 0, 0]);
        const targetPadding = new Padding([1, 2, 6, 4]);

        const i11nFn = (t: number) => interpolate.padding(padding, targetPadding, t);
        expect(i11nFn(0.5)).toBeInstanceOf(Padding);
        expect(i11nFn(0.5)).toEqual(new Padding([0.5, 1, 3, 2]));
    });

    describe('interpolate variableAnchorOffsetCollection', () => {
        const i11nFn = interpolate.variableAnchorOffsetCollection;
        const parseFn = VariableAnchorOffsetCollection.parse;

        test('should throw with mismatched endpoints', () => {
            expect(() => i11nFn(parseFn(['top', [0, 0]]), parseFn(['bottom', [1, 1]]), 0.5)).toThrow('Cannot interpolate values containing mismatched anchors. from[0]: top, to[0]: bottom');
            expect(() => i11nFn(parseFn(['top', [0, 0]]), parseFn(['top', [1, 1], 'bottom', [2, 2]]), 0.5)).toThrow('Cannot interpolate values of different length. from: ["top",[0,0]], to: ["top",[1,1],"bottom",[2,2]]');
        });

        test('should interpolate offsets', () => {
            expect(i11nFn(parseFn(['top', [0, 0], 'bottom', [2, 2]]), parseFn(['top', [1, 1], 'bottom', [4, 4]]), 0.5).values).toEqual(['top', [0.5, 0.5], 'bottom', [3, 3]]);
        });
    });

});

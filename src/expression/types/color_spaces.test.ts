import {expectCloseToArray} from '../../../test/lib/util';
import {
    hclToRgb,
    hslToRgb,
    labToRgb,
    oklchToRgb,
    rgbToHcl,
    rgbToLab,
    rgbToOklch
} from './color_spaces';
import {describe, expect, test} from 'vitest';

describe('color spaces', () => {
    describe('LAB color space', () => {
        test('should convert colors from sRGB to LAB color space', () => {
            expectCloseToArray(rgbToLab([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(rgbToLab([1, 1, 1, 1]), [100, 0, 0, 1], 4);
            expectCloseToArray(rgbToLab([0, 1, 0, 1]), [87.82, -79.29, 80.99, 1], 2);
            expectCloseToArray(rgbToLab([0, 1, 1, 1]), [90.67, -50.67, -14.96, 1], 2);
            expectCloseToArray(rgbToLab([0, 0, 1, 1]), [29.57, 68.3, -112.03, 1], 2);
            expectCloseToArray(rgbToLab([1, 1, 0, 1]), [97.61, -15.75, 93.39, 1], 2);
            expectCloseToArray(rgbToLab([1, 0, 0, 1]), [54.29, 80.81, 69.89, 1], 2);
        });

        test('should convert colors from LAB to sRGB color space', () => {
            expectCloseToArray(labToRgb([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(labToRgb([100, 0, 0, 1]), [1, 1, 1, 1]);
            expectCloseToArray(labToRgb([50, 50, 0, 1]), [0.7562, 0.3045, 0.4756, 1], 4);
            expectCloseToArray(labToRgb([70, -45, 0, 1]), [0.1079, 0.7556, 0.664, 1], 4);
            expectCloseToArray(labToRgb([70, 0, 70, 1]), [0.7663, 0.6636, 0.0558, 1], 4);
            expectCloseToArray(labToRgb([55, 0, -60, 1]), [0.1281, 0.531, 0.9276, 1], 4);
            expectCloseToArray(labToRgb([29.57, 68.3, -112.03, 1]), [0, 0, 1, 1], 3);
        });
    });

    describe('HCL color space', () => {
        test('should convert colors from sRGB to HCL color space', () => {
            expectCloseToArray(rgbToHcl([0, 0, 0, 1]), [NaN, 0, 0, 1]);
            expectCloseToArray(rgbToHcl([1, 1, 1, 1]), [NaN, 0, 100, 1], 4);
            expectCloseToArray(rgbToHcl([0, 1, 0, 1]), [134.39, 113.34, 87.82, 1], 2);
            expectCloseToArray(rgbToHcl([0, 1, 1, 1]), [196.45, 52.83, 90.67, 1], 2);
            expectCloseToArray(rgbToHcl([0, 0, 1, 1]), [301.37, 131.21, 29.57, 1], 2);
            expectCloseToArray(rgbToHcl([1, 1, 0, 1]), [99.57, 94.71, 97.61, 1], 2);
            expectCloseToArray(rgbToHcl([1, 0, 0, 1]), [40.85, 106.84, 54.29, 1], 2);
        });

        test('should convert colors from HCL to sRGB color space', () => {
            expectCloseToArray(hclToRgb([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(hclToRgb([0, 0, 100, 1]), [1, 1, 1, 1]);
            expectCloseToArray(hclToRgb([0, 50, 50, 1]), [0.7562, 0.3045, 0.4756, 1], 4);
            expectCloseToArray(hclToRgb([180, 45, 70, 1]), [0.1079, 0.7556, 0.664, 1], 4);
            expectCloseToArray(hclToRgb([90, 70, 70, 1]), [0.7663, 0.6636, 0.0558, 1], 4);
            expectCloseToArray(hclToRgb([270, 60, 55, 1]), [0.1281, 0.531, 0.9276, 1], 4);
            expectCloseToArray(hclToRgb([301.37, 131.21, 29.57, 1]), [0, 0, 1, 1], 3);
        });
    });

    describe('OKLCH color space', () => {
        test('should convert colors from sRGB to OKLCH color space', () => {
            expectCloseToArray(rgbToOklch([1, 0, 0, 1]), [0.627955, 0.257683, 29.23388, 1]);
            expectCloseToArray(rgbToOklch([0, 0, 1, 1]), [0.452014, 0.313214, 264.052, 1], 3);
            expectCloseToArray(rgbToOklch([0, 1, 0, 1]), [0.86644, 0.294827, 142.4953, 1], 4);
            expectCloseToArray(
                rgbToOklch([0.2, 0.4, 0.6, 0.5]),
                [0.499315, 0.098664, 250.4331, 0.5],
                4
            );
        });

        test('should leave the hue of a gray missing', () => {
            expectCloseToArray(rgbToOklch([1, 1, 1, 1]), [1, 0, NaN, 1]);
            expectCloseToArray(rgbToOklch([0, 0, 0, 1]), [0, 0, NaN, 1]);
            expectCloseToArray(rgbToOklch([0.5, 0.5, 0.5, 0.3]), [0.598181, 0, NaN, 0.3]);
        });

        test('should convert colors from OKLCH to sRGB color space', () => {
            expectCloseToArray(oklchToRgb([0.7, 0.1, 30, 1]), [0.836736, 0.526627, 0.475198, 1]);
            expectCloseToArray(
                oklchToRgb([0.6, 0.1, 90, 0.5]),
                [0.593719, 0.490828, 0.190116, 0.5]
            );
            expectCloseToArray(oklchToRgb([0.6, 0, NaN, 1]), [0.502111, 0.502111, 0.502111, 1]);
        });

        test('should clip colors outside sRGB', () => {
            expectCloseToArray(oklchToRgb([0.7, 0.3, 140, 1]), [0, 0.771585, 0, 1]);
            expectCloseToArray(oklchToRgb([0.9, 0.3, 300, 1]), [1, 0.625509, 1, 1]);
            expectCloseToArray(oklchToRgb([0.3, 0.25, 30, 1]), [0.50917, 0, 0, 1]);
        });

        test('should give a huge chroma the color of chroma 1e6', () => {
            expect(oklchToRgb([0.6, 1e110, 90, 1])).toEqual([0, 1, 0, 1]);
            expect(oklchToRgb([0.6, 1e110, 90, 1])).toEqual(oklchToRgb([0.6, 1e6, 90, 1]));
        });
    });

    describe('HSL color space', () => {
        test('should convert colors from HSL to sRGB color space', () => {
            expectCloseToArray(hslToRgb([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(hslToRgb([0, 100, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(hslToRgb([0, 0, 100, 1]), [1, 1, 1, 1]);
            expectCloseToArray(hslToRgb([360, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(hslToRgb([120, 100, 25, 1]), [0, 128 / 255, 0, 1], 2);
            expectCloseToArray(hslToRgb([120, 30, 50, 0]), [89 / 255, 166 / 255, 89 / 255, 0], 2);
            expectCloseToArray(
                hslToRgb([240, 25, 50, 0.1]),
                [96 / 255, 96 / 255, 159 / 255, 0.1],
                2
            );
            expectCloseToArray(
                hslToRgb([240, 50, 50, 0.8]),
                [64 / 255, 64 / 255, 191 / 255, 0.8],
                2
            );
            expectCloseToArray(hslToRgb([270, 75, 75, 1]), [191 / 255, 143 / 255, 239 / 255, 1], 2);
            expectCloseToArray(hslToRgb([300, 100, 50, 0.5]), [1, 0, 1, 0.5]);
            expectCloseToArray(hslToRgb([330, 0, 25, 0.3]), [64 / 255, 64 / 255, 64 / 255, 0.3], 2);
        });
    });
});

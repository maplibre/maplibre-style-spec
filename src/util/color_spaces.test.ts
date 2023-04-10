import {expectCloseToArray} from '../../test/unit/testUtils';
import {hclToRgb, hslToRgb, labToRgb, rgbToHcl, rgbToLab} from './color_spaces';

describe('color spaces', () => {

    describe('LAB color space', () => {

        test('should convert colors from sRGB to LAB color space', () => {
            expectCloseToArray(rgbToLab([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(rgbToLab([1, 1, 1, 1]), [100, 0, 0, 1], 4);
            expectCloseToArray(rgbToLab([0, 1, 0, 1]), [87.73, -86.18, 83.18, 1], 2);
            expectCloseToArray(rgbToLab([0, 1, 1, 1]), [91.11, -48.09, -14.13, 1], 2);
            expectCloseToArray(rgbToLab([0, 0, 1, 1]), [32.3, 79.19, -107.86, 1], 2);
            expectCloseToArray(rgbToLab([1, 1, 0, 1]), [97.14, -21.55, 94.48, 1], 2);
            expectCloseToArray(rgbToLab([1, 0, 0, 1]), [53.24, 80.09, 67.2, 1], 2);
        });

        test('should convert colors from LAB to sRGB color space', () => {
            expectCloseToArray(labToRgb([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(labToRgb([100, 0, 0, 1]), [1, 1, 1, 1]);
            expectCloseToArray(labToRgb([50, 50, 0, 1]), [0.7605, 0.3096, 0.4734, 1], 4);
            expectCloseToArray(labToRgb([70, -45, 0, 1]), [0.0469, 0.7537, 0.6656, 1], 4);
            expectCloseToArray(labToRgb([70, 0, 70, 1]), [0.7955, 0.6590, 0.0818, 1], 4);
            expectCloseToArray(labToRgb([55, 0, -60, 1]), [0, 0.5403, 0.9255, 1], 4);
            expectCloseToArray(labToRgb([32.3, 79.19, -107.86, 1]), [0, 0, 1, 1], 3);
        });

    });

    describe('HCL color space', () => {

        test('should convert colors from sRGB to HCL color space', () => {
            expectCloseToArray(rgbToHcl([0, 0, 0, 1]), [NaN, 0, 0, 1]);
            expectCloseToArray(rgbToHcl([1, 1, 1, 1]), [NaN, 0, 100, 1], 4);
            expectCloseToArray(rgbToHcl([0, 1, 0, 1]), [136.02, 119.78, 87.73, 1], 2);
            expectCloseToArray(rgbToHcl([0, 1, 1, 1]), [196.38, 50.12, 91.11, 1], 2);
            expectCloseToArray(rgbToHcl([0, 0, 1, 1]), [306.28, 133.81, 32.30, 1], 2);
            expectCloseToArray(rgbToHcl([1, 1, 0, 1]), [102.85, 96.91, 97.14, 1], 2);
            expectCloseToArray(rgbToHcl([1, 0, 0, 1]), [40.00, 104.55, 53.24, 1], 2);
        });

        test('should convert colors from HCL to sRGB color space', () => {
            expectCloseToArray(hclToRgb([0, 0, 0, 1]), [0, 0, 0, 1]);
            expectCloseToArray(hclToRgb([0, 0, 100, 1]), [1, 1, 1, 1]);
            expectCloseToArray(hclToRgb([0, 50, 50, 1]), [0.7605, 0.3096, 0.4734, 1], 4);
            expectCloseToArray(hclToRgb([180, 45, 70, 1]), [0.0469, 0.7537, 0.6656, 1], 4);
            expectCloseToArray(hclToRgb([90, 70, 70, 1]), [0.7955, 0.6590, 0.0818, 1], 4);
            expectCloseToArray(hclToRgb([270, 60, 55, 1]), [0, 0.5403, 0.9255, 1], 4);
            expectCloseToArray(hclToRgb([306.28, 133.81, 32.30, 1]), [0, 0, 1, 1], 3);
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
            expectCloseToArray(hslToRgb([240, 25, 50, 0.1]), [96 / 255, 96 / 255, 159 / 255, 0.1], 2);
            expectCloseToArray(hslToRgb([240, 50, 50, 0.8]), [64 / 255, 64 / 255, 191 / 255, 0.8], 2);
            expectCloseToArray(hslToRgb([270, 75, 75, 1]), [191 / 255, 143 / 255, 239 / 255, 1], 2);
            expectCloseToArray(hslToRgb([300, 100, 50, 0.5]), [1, 0, 1, 0.5]);
            expectCloseToArray(hslToRgb([330, 0, 25, 0.3]), [64 / 255, 64 / 255, 64 / 255, 0.3], 2);
        });

    });

});

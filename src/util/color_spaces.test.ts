import {hcl, hsl, lab} from './color_spaces';

describe('color spaces', () => {

    describe('LAB color space', () => {

        test('should convert colors from sRGB to LAB color space', () => {
            expect(lab.fromRgb([0, 0, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(lab.fromRgb([1, 1, 1, 1])).closeToNumberArray([100, 0, 0, 1], 4);
            expect(lab.fromRgb([0, 1, 0, 1])).closeToNumberArray([87.73, -86.18, 83.18, 1], 2);
            expect(lab.fromRgb([0, 1, 1, 1])).closeToNumberArray([91.11, -48.09, -14.13, 1], 2);
            expect(lab.fromRgb([0, 0, 1, 1])).closeToNumberArray([32.3, 79.19, -107.86, 1], 2);
            expect(lab.fromRgb([1, 1, 0, 1])).closeToNumberArray([97.14, -21.55, 94.48, 1], 2);
            expect(lab.fromRgb([1, 0, 0, 1])).closeToNumberArray([53.24, 80.09, 67.2, 1], 2);
        });

        test('should convert colors from LAB to sRGB color space', () => {
            expect(lab.toRgb([0, 0, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(lab.toRgb([100, 0, 0, 1])).closeToNumberArray([1, 1, 1, 1]);
            expect(lab.toRgb([50, 50, 0, 1])).closeToNumberArray([0.7605, 0.3096, 0.4734, 1], 4);
            expect(lab.toRgb([70, -45, 0, 1])).closeToNumberArray([0.0469, 0.7537, 0.6656, 1], 4);
            expect(lab.toRgb([70, 0, 70, 1])).closeToNumberArray([0.7955, 0.6590, 0.0818, 1], 4);
            expect(lab.toRgb([55, 0, -60, 1])).closeToNumberArray([0, 0.5403, 0.9255, 1], 4);
            expect(lab.toRgb([32.3, 79.19, -107.86, 1])).closeToNumberArray([0, 0, 1, 1], 3);
        });

    });

    describe('HCL color space', () => {

        test('should convert colors from sRGB to HCL color space', () => {
            expect(hcl.fromRgb([0, 0, 0, 1])).closeToNumberArray([NaN, 0, 0, 1]);
            expect(hcl.fromRgb([1, 1, 1, 1])).closeToNumberArray([NaN, 0, 100, 1], 4);
            expect(hcl.fromRgb([0, 1, 0, 1])).closeToNumberArray([136.02, 119.78, 87.73, 1], 2);
            expect(hcl.fromRgb([0, 1, 1, 1])).closeToNumberArray([196.38, 50.12, 91.11, 1], 2);
            expect(hcl.fromRgb([0, 0, 1, 1])).closeToNumberArray([306.28, 133.81, 32.30, 1], 2);
            expect(hcl.fromRgb([1, 1, 0, 1])).closeToNumberArray([102.85, 96.91, 97.14, 1], 2);
            expect(hcl.fromRgb([1, 0, 0, 1])).closeToNumberArray([40.00, 104.55, 53.24, 1], 2);
        });

        test('should convert colors from HCL to sRGB color space', () => {
            expect(hcl.toRgb([0, 0, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(hcl.toRgb([0, 0, 100, 1])).closeToNumberArray([1, 1, 1, 1]);
            expect(hcl.toRgb([0, 50, 50, 1])).closeToNumberArray([0.7605, 0.3096, 0.4734, 1], 4);
            expect(hcl.toRgb([180, 45, 70, 1])).closeToNumberArray([0.0469, 0.7537, 0.6656, 1], 4);
            expect(hcl.toRgb([90, 70, 70, 1])).closeToNumberArray([0.7955, 0.6590, 0.0818, 1], 4);
            expect(hcl.toRgb([270, 60, 55, 1])).closeToNumberArray([0, 0.5403, 0.9255, 1], 4);
            expect(hcl.toRgb([306.28, 133.81, 32.30, 1])).closeToNumberArray([0, 0, 1, 1], 3);
        });

    });

    describe('HSL color space', () => {

        test('should convert colors from HSL to sRGB color space', () => {
            expect(hsl.toRgb([0, 0, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(hsl.toRgb([0, 100, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(hsl.toRgb([0, 0, 100, 1])).closeToNumberArray([1, 1, 1, 1]);
            expect(hsl.toRgb([360, 0, 0, 1])).closeToNumberArray([0, 0, 0, 1]);
            expect(hsl.toRgb([120, 100, 25, 1])).closeToNumberArray([0, 128 / 255, 0, 1], 2);
            expect(hsl.toRgb([120, 30, 50, 0])).closeToNumberArray([89 / 255, 166 / 255, 89 / 255, 0], 2);
            expect(hsl.toRgb([240, 25, 50, 0.1])).closeToNumberArray([96 / 255, 96 / 255, 159 / 255, 0.1], 2);
            expect(hsl.toRgb([240, 50, 50, 0.8])).closeToNumberArray([64 / 255, 64 / 255, 191 / 255, 0.8], 2);
            expect(hsl.toRgb([270, 75, 75, 1])).closeToNumberArray([191 / 255, 143 / 255, 239 / 255, 1], 2);
            expect(hsl.toRgb([300, 100, 50, 0.5])).closeToNumberArray([1, 0, 1, 0.5]);
            expect(hsl.toRgb([330, 0, 25, 0.3])).closeToNumberArray([64 / 255, 64 / 255, 64 / 255, 0.3], 2);
        });

    });

});

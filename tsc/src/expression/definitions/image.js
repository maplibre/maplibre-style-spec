import { ResolvedImageType, StringType } from '../types';
import ResolvedImage from '../types/resolved_image';
export default class ImageExpression {
    constructor(input) {
        this.type = ResolvedImageType;
        this.input = input;
    }
    static parse(args, context) {
        if (args.length !== 2) {
            return context.error('Expected two arguments.');
        }
        const name = context.parse(args[1], 1, StringType);
        if (!name)
            return context.error('No image name provided.');
        return new ImageExpression(name);
    }
    evaluate(ctx) {
        const evaluatedImageName = this.input.evaluate(ctx);
        const value = ResolvedImage.fromString(evaluatedImageName);
        if (value && ctx.availableImages)
            value.available = ctx.availableImages.indexOf(evaluatedImageName) > -1;
        return value;
    }
    eachChild(fn) {
        fn(this.input);
    }
    outputDefined() {
        // The output of image is determined by the list of available images in the evaluation context
        return false;
    }
}
//# sourceMappingURL=image.js.map
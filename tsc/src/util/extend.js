export default function extendBy(output, ...inputs) {
    for (const input of inputs) {
        for (const k in input) {
            output[k] = input[k];
        }
    }
    return output;
}
//# sourceMappingURL=extend.js.map
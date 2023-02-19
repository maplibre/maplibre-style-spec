export function supportsPropertyExpression(spec) {
    return spec['property-type'] === 'data-driven' || spec['property-type'] === 'cross-faded-data-driven';
}
export function supportsZoomExpression(spec) {
    return !!spec.expression && spec.expression.parameters.indexOf('zoom') > -1;
}
export function supportsInterpolation(spec) {
    return !!spec.expression && spec.expression.interpolated;
}
//# sourceMappingURL=properties.js.map
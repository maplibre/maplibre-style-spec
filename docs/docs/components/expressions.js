import ref from '../../maplibre-gl-js/rollup/build/tsc/src/style-spec/reference/latest';
import { types } from './expression-metadata';

export const expressions = {};
export const expressionGroups = {};

for (const name in types) {
    const spec = ref['expression_name'].values[name];
    expressionGroups[spec.group] = expressionGroups[spec.group] || [];
    expressionGroups[spec.group].push(name);
    expressions[name] = {
        name,
        doc: spec.doc,
        type: types[name],
        sdkSupport: spec['sdk-support']
    };
}

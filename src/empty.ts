import {spec} from './reference/latest';
import {StyleSpecification} from './types.g';

export function emptyStyle(): StyleSpecification {
    const style = {};

    const version = spec['$version'];
    for (const styleKey in spec['$root']) {
        const specification = spec['$root'][styleKey];

        if (specification.required) {
            let value = null;
            if (styleKey === 'version') {
                value = version;
            } else {
                if (specification.type === 'array') {
                    value = [];
                } else {
                    value = {};
                }
            }

            if (value != null) {
                style[styleKey] = value;
            }
        }
    }

    return style as StyleSpecification;
}

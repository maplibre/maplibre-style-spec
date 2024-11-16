import {latest} from './reference/latest';
import {StyleSpecification} from './types.g';

export function emptyStyle(): StyleSpecification {
    const style = {};

    const version = latest['$version'];
    for (const styleKey in latest['$root']) {
        const specification = latest['$root'][styleKey];

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

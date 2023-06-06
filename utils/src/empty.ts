import specification from './style-spec/specification.json' assert {type: 'json'};
import {StyleSpecification} from './types.g';

export default function emptyStyle(): StyleSpecification {
    const style = {};

    const version = specification['$version'];
    for (const styleKey in specification['$root']) {
        const spec = specification['$root'][styleKey];

        if (spec.required) {
            let value = null;
            if (styleKey === 'version') {
                value = version;
            } else {
                if (spec.type === 'array') {
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

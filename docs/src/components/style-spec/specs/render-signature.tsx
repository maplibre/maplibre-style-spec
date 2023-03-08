import {renderParams} from './render-params';
import {h} from 'preact';
export function renderSignature(name, overload) {
    name = JSON.stringify(name);
    const maxLength = 80 - name.length - overload.type.length;
    const params = renderParams(overload.parameters, maxLength);
    return `[${name}${params}]: ${overload.type}`;
}

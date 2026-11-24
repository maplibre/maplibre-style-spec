import {isBoxed} from './unbundle_jsonlint';

export function getType(val: unknown): string {
    if (isBoxed(val, Number)) {
        return 'number';
    } else if (isBoxed(val, String)) {
        return 'string';
    } else if (isBoxed(val, Boolean)) {
        return 'boolean';
    } else if (Array.isArray(val)) {
        return 'array';
    } else if (val === null) {
        return 'null';
    } else {
        return typeof val;
    }
}

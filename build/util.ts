import jsonStringify from 'json-stringify-pretty-compact';

/**
 * Formats a JSON value into a reasonably compact and readable JSON string.
 * 
 * @param obj - object to be formatted
 * @returns formatted JSON
 */
export function formatJSON(obj: any) {
    return jsonStringify(obj, {
        indent: 4,
        maxLength: 60
    });
}

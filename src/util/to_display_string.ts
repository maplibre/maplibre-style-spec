import {unbundle} from './unbundle_jsonlint';

/**
 * Formats an untrusted style value for use in an error message.
 *
 * Unlike `String(value)` or a template literal, this doesn't throw when the value is an object without
 * a usable `toString`, e.g. `{"toString": null}` or an object with a null prototype.
 * @param value - the value to format
 * @returns the string representation of primitives, JSON for everything else
 */
export function toDisplayString(value: unknown): string {
    const unbundled = unbundle(value);
    return typeof unbundled === 'object' && unbundled !== null
        ? JSON.stringify(unbundled)
        : String(unbundled);
}

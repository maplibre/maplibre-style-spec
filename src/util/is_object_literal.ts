export function isObjectLiteral(anything: unknown): anything is Record<string, unknown> {
    return Boolean(anything) && anything.constructor === Object;
}

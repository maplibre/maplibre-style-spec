// Note: Do not inherit from Error. It breaks when transpiling to ES5.

/**
 * How badly a style is broken.
 *
 * - `error`: the style is invalid and cannot be rendered as written.
 * - `warning`: the style renders, but almost certainly not as its author intended -- for
 *   example a filter that mixes deprecated syntax into an expression tree. Consumers should
 *   surface these (a style editor lists them; a map logs them) but must keep rendering.
 */
export type ValidationSeverity = 'error' | 'warning';

export class ValidationError {
    message: string;
    identifier: string;
    line: number;
    severity: ValidationSeverity;

    constructor(
        key: string,
        value: any & {
            __line__: number;
        },
        message: string,
        identifier?: string | null,
        severity: ValidationSeverity = 'error'
    ) {
        this.message = (key ? `${key}: ` : '') + message;
        if (identifier) this.identifier = identifier;
        this.severity = severity;

        if (value !== null && value !== undefined && value.__line__) {
            this.line = value.__line__;
        }
    }
}

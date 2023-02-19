export default class ValidationError {
    message: string;
    identifier: string;
    line: number;
    constructor(key: string, value: any & {
        __line__: number;
    }, message: string, identifier?: string | null);
}

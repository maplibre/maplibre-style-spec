declare class RuntimeError {
    name: string;
    message: string;
    constructor(message: string);
    toJSON(): string;
}
export default RuntimeError;

export default class ParsingError {
    message: string;
    error: Error;
    line: number;
    constructor(error: Error);
}

declare class ExpressionParsingError extends Error {
    key: string;
    message: string;
    constructor(key: string, message: string);
}
export default ExpressionParsingError;

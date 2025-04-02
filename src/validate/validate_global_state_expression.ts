import {getOwn} from '../util/get_own';
import {Expression} from '../expression/expression';
import {GlobalState} from '../expression/definitions/global_state';
import {ValidationError} from '../error/validation_error';

export function validateGlobalStateExpression(expression: Expression, options: any) {
    const results = new Set<string>();
    findGlobalStateExpressionKeys(expression, results);

    const errors: ValidationError[] = [];
    for (const key of results) {
        errors.push(...validateIfDefinedInGlobalState(key, options));
    }

    return errors;
}

function findGlobalStateExpressionKeys(expression: Expression, results:Set<string>) {
    if (expression instanceof GlobalState) {
        results.add(expression.key);
    }

    expression.eachChild((child) => {
        findGlobalStateExpressionKeys(child, results);
    });
}

function validateIfDefinedInGlobalState(key: string, options: any) {
    if (options.style.state === undefined || getOwn(options.style.state, key) === undefined) {
        return [new ValidationError(options.key, options.value, `required "global-state" key "${key}" is not defined in the style state property.`)];
    }

    return [];
}

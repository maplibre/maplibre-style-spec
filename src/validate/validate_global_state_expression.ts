import {getOwn} from '../util/get_own';
import {Expression} from '../expression/expression';
import {GlobalState} from '../expression/definitions/global_state';
import {ValidationError} from '../error/validation_error';

export function validateGlobalStateExpression(globalStateExpression: GlobalState, options: any) {
    const key = globalStateExpression.key;
    if (options.style.state === undefined || getOwn(options.style.state, key) === undefined) {
        return [new ValidationError(options.key, options.value, `required "global-state" key "${key}" is not defined in the style state property.`)];
    }

    return [];
}

export function findGlobalStateExpression(expression: Expression): GlobalState {
    if (expression instanceof GlobalState) {
        return expression;
    }

    let result = null;
    expression.eachChild((child) => {
        result = findGlobalStateExpression(child);
    });

    return result;
}

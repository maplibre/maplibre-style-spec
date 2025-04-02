import {getOwn} from '../util/get_own';
import {Expression} from '../expression/expression';
import {GlobalState} from '../expression/definitions/global_state';
import {ValidationError} from '../error/validation_error';

export function validateIfDefinedInGlobalState(key: string, options: any) {
    if (options.style.state === undefined || getOwn(options.style.state, key) === undefined) {
        return [new ValidationError(options.key, options.value, `required "global-state" key "${key}" is not defined in the style state property.`)];
    }

    return [];
}

export function findGlobalStateExpressionKeys(expression: Expression, results:Set<string>) {
    if (expression instanceof GlobalState) {
        results.add(expression.key);
    }

    expression.eachChild((child) => {
        findGlobalStateExpressionKeys(child, results);
    });
}

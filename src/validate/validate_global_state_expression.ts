import {getOwn} from '../util/get_own';
import {Expression} from '../expression/expression';
import {GlobalState} from '../expression/definitions/global_state';
import {ValidationError} from '../error/validation_error';
import {createExpression} from '../expression';
import {deepUnbundle} from '../util/unbundle_jsonlint';

export function validateGlobalStateExpression(globalStateExpression: GlobalState, options: any) {
    const key = globalStateExpression.key;
    if (options.style.state === undefined || getOwn(options.style.state, key) === undefined) {
        return [new ValidationError(options.key, options.value, `required "global-state" key "${key}" is not defined in the style state property.`)];
    }

    const statePropertyValue = getOwn(options.style.state, key);
    const statePropertyValueExpression = createExpression(deepUnbundle(statePropertyValue), options.valueSpec);

    if (statePropertyValueExpression.result === 'error') {
        return statePropertyValueExpression.value.map((error) => {
            return new ValidationError(`${options.key}${error.key}`, options.value, error.message);
        });
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

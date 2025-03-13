import {ValidationError} from '../error/validation_error';
import {getType} from '../util/get_type';
import v8 from '../reference/v8.json' with {type: 'json'};
import {StateSpecification, StyleSpecification} from '../types.g';

interface ValidateStateOptions {
    key: 'state';
    value: unknown; // we don't know how the user defined the "state"
    styleSpec: typeof v8;
    style: StyleSpecification;
    validateSpec: Function;
}

export function validateState(options: ValidateStateOptions) {
    const state = options.value;
    const rootType = getType(state);
    
    if (rootType !== 'object') {
        return [new ValidationError(options.key, state, `object expected, ${rootType} found`)];
    }

    return [];
}

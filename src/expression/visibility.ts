import {createExpression, findGlobalStateRefs} from './index';
import {type GlobalProperties, type StylePropertySpecification} from '../index';
import {type VisibilitySpecification} from '../types.g';

const visibilitySpec: StylePropertySpecification = {
    type: 'enum',
    'property-type': 'data-constant',
    expression: {
        interpolated: false,
        parameters: ['global-state']
    },
    values: {visible: {}, none: {}},
    transition: false,
    default: 'visible'
};

export type VisibilityExpression = {
    evaluate: () => 'visible' | 'none';
    setValue: (visibility: VisibilitySpecification) => void;
    getGlobalStateRefs: () => Set<string>;
};

/**
 * Creates a visibility expression from a visibility specification.
 * The visibility expression exposes following functions:
 * `evaluate` to get the current visibility value.
 * `setValue` to update the visibility specification.
 * `getGlobalStateRefs` to get the set of global state properties referenced by the expression.
 */
export default function createVisibility(visibility: VisibilitySpecification, globalState: Record<string, any>): VisibilityExpression {
    const expression: VisibilityExpression = {
        setValue,
        evaluate: null,
        getGlobalStateRefs: () => new Set<string>()
    };
    setValue(visibility);
    return expression;

    function setValue(visibility: VisibilitySpecification) {
        if (visibility === null || visibility === undefined || visibility === 'visible' || visibility === 'none') {
            expression.evaluate = visibility === 'none' ? () => 'none' : () => 'visible';
            addGlobalStateRefs(expression);
            return;
        }

        const compiled = createExpression(visibility, visibilitySpec, globalState);
        if (compiled.result === 'error') {
            throw new Error(compiled.value.map(err => `${err.key}: ${err.message}`).join(', '));
        }
        expression.evaluate = () => compiled.value.evaluate({} as GlobalProperties);
        addGlobalStateRefs(expression, () => findGlobalStateRefs(compiled.value.expression));
    }
}

function addGlobalStateRefs(visibility: VisibilityExpression, getGlobalStateRefs: () => Set<string> = () => new Set<string>()) {
    visibility.getGlobalStateRefs = getGlobalStateRefs;
}

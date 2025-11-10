import {createExpression, findGlobalStateRefs} from '.';
import {type GlobalProperties, type StylePropertySpecification} from '..';
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

export default function createVisibility(visibility: VisibilitySpecification, globalState: Record<string, any>) {
    const expression = {
        setValue,
        evaluate: null
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

function addGlobalStateRefs(visibility, getGlobalStateRefs: () => Set<string> = () => new Set<string>()) {
    visibility.getGlobalStateRefs = getGlobalStateRefs;
}

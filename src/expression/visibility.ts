import {createExpression, findGlobalStateRefs} from './index';
import {StyleExpression, type GlobalProperties, type StylePropertySpecification} from '../index';
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

export interface VisibilityExpression {
    /**
     * Evaluates the visibility expression and returns either 'visible' or 'none'.
     */
    evaluate: () => 'visible' | 'none';
    /**
     * Updates the visibility specification.
     */
    setValue: (visibility: VisibilitySpecification) => void;
    /**
     * Returns the set of global state properties referenced by the expression.
     */
    getGlobalStateRefs: () => Set<string>;
}

class VisibilityExpressionClass implements VisibilityExpression {
    private _globalState: Record<string, any>;
    private _globalStateRefs: Set<string>;
    private _literalValue: 'visible' | 'none' | undefined;
    private _compiledValue: StyleExpression;

    constructor(visibility: VisibilitySpecification, globalState: Record<string, any>) {
        this._globalState = globalState;
        this.setValue(visibility);
    }

    evaluate(): 'visible' | 'none' {
        return this._literalValue ?? this._compiledValue.evaluate({} as GlobalProperties);
    }

    setValue(visibility: VisibilitySpecification) {
        if (
            visibility === null ||
            visibility === undefined ||
            visibility === 'visible' ||
            visibility === 'none'
        ) {
            this._literalValue = visibility === 'none' ? 'none' : 'visible';
            this._compiledValue = undefined;
            this._globalStateRefs = new Set<string>();
            return;
        }
        const compiled = createExpression(visibility, visibilitySpec, this._globalState);
        if (compiled.result === 'error') {
            this._literalValue = 'visible';
            this._compiledValue = undefined;
            throw new Error(compiled.value.map((err) => `${err.key}: ${err.message}`).join(', '));
        }
        this._literalValue = undefined;
        this._compiledValue = compiled.value;
        this._globalStateRefs = findGlobalStateRefs(compiled.value.expression);
    }

    getGlobalStateRefs() {
        return this._globalStateRefs;
    }
}

/**
 * Creates a visibility expression from a visibility specification.
 * @param visibility - the visibility specification, literal or expression
 * @param globalState - the global state object
 * @returns visibility expression object
 */
export default function createVisibility(
    visibility: VisibilitySpecification,
    globalState: Record<string, any>
): VisibilityExpression {
    return new VisibilityExpressionClass(visibility, globalState);
}

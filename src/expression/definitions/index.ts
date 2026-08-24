import {Let} from './let';
import {Var} from './var';
import {Literal} from './literal';
import {Assertion} from './assertion';
import {Coercion} from './coercion';
import {At} from './at';
import {In} from './in';
import {IndexOf} from './index_of';
import {Match} from './match';
import {Case} from './case';
import {Slice} from './slice';
import {Step} from './step';
import {Interpolate} from './interpolate';
import {Coalesce} from './coalesce';
import {
    Equals,
    NotEquals,
    LessThan,
    GreaterThan,
    LessThanOrEqual,
    GreaterThanOrEqual
} from './comparison';
import {CollatorExpression} from './collator';
import {NumberFormat} from './number_format';
import {FormatExpression} from './format';
import {ImageExpression} from './image';
import {Length} from './length';
import {Within} from './within';
import {Distance} from './distance';
import {Semiliteral} from './semiliteral';
import {GlobalState} from './global_state';

import {CompoundExpression, compoundExpressionDefinitions} from '../compound_expression';

import type {ExpressionRegistry} from '../expression';

function createExpressionRegistry(): ExpressionRegistry {
    const registry: ExpressionRegistry = {
        // special forms
        '==': Equals,
        '!=': NotEquals,
        '>': GreaterThan,
        '<': LessThan,
        '>=': GreaterThanOrEqual,
        '<=': LessThanOrEqual,
        array: Assertion,
        at: At,
        boolean: Assertion,
        case: Case,
        coalesce: Coalesce,
        collator: CollatorExpression,
        format: FormatExpression,
        image: ImageExpression,
        in: In,
        'index-of': IndexOf,
        interpolate: Interpolate,
        'interpolate-hcl': Interpolate,
        'interpolate-lab': Interpolate,
        length: Length,
        let: Let,
        literal: Literal,
        match: Match,
        number: Assertion,
        'number-format': NumberFormat,
        object: Assertion,
        semiliteral: Semiliteral,
        slice: Slice,
        step: Step,
        string: Assertion,
        'to-boolean': Coercion,
        'to-color': Coercion,
        'to-number': Coercion,
        'to-string': Coercion,
        var: Var,
        within: Within,
        distance: Distance,
        'global-state': GlobalState
    };

    CompoundExpression.register(registry, compoundExpressionDefinitions);

    return registry;
}

/**
 * The registry of every expression the parser knows how to build.
 *
 * The `@__PURE__` annotation lets a bundler delete this call, and everything
 * only it reaches, when a consumer imports nothing that needs the registry.
 * It is sound because `createExpressionRegistry` only fills in a registry it
 * created itself: the one assignment it makes outside that object writes
 * `CompoundExpression.definitions` with the value the class already holds.
 */
export const expressions: ExpressionRegistry = /* @__PURE__ */ createExpressionRegistry();

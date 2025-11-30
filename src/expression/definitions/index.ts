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
import {GlobalState} from './global_state';

import type {ExpressionRegistry} from '../expression';

export const expressions: ExpressionRegistry = {
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

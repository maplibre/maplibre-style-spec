import {
    toString as typeToString,
    NumberType,
    StringType,
    BooleanType,
    ColorType,
    ObjectType,
    ValueType,
    ErrorType,
    CollatorType,
    array
} from '../../expression/types';
import CompoundExpression from '../../expression/compound_expression';
import {
    Color,
    validateRGBA,
    typeOf,
    toString as valueToString
} from '../../expression/values';
import {h} from 'preact';

// registers compound expressions
import expressionRegister from '../../expression/definitions/index';
import RuntimeError from '../../expression/runtime_error';

function has(key, obj) {
    return key in obj;
}

function get(key, obj) {
    const v = obj[key];
    return typeof v === 'undefined' ? null : v;
}
function rgba(ctx, [r, g, b, a]) {
    r = r.evaluate(ctx);
    g = g.evaluate(ctx);
    b = b.evaluate(ctx);
    const alpha = a ? a.evaluate(ctx) : 1;
    const error = validateRGBA(r, g, b, alpha);
    if (error) throw new RuntimeError(error);
    return new Color(
        (r / 255) * alpha,
        (g / 255) * alpha,
        (b / 255) * alpha,
        alpha
    );
}

function binarySearch(v, a, i, j) {
    while (i <= j) {
        const m = (i + j) >> 1;
        if (a[m] === v) return true;
        if (a[m] > v) j = m - 1;
        else i = m + 1;
    }
    return false;
}

function varargs(type) {
    return {type};
}

CompoundExpression.register(expressionRegister, {
    error: [
        ErrorType,
        [StringType],
        (ctx, [v]) => {
            throw new RuntimeError(v.evaluate(ctx));
        }
    ],
    typeof: [
        StringType,
        [ValueType],
        (ctx, [v]) => typeToString(typeOf(v.evaluate(ctx)))
    ],
    'to-rgba': [
        array(NumberType, 4),
        [ColorType],
        (ctx, [v]) => {
            return v.evaluate(ctx).toArray();
        }
    ],
    rgb: [ColorType, [NumberType, NumberType, NumberType], rgba],
    rgba: [ColorType, [NumberType, NumberType, NumberType, NumberType], rgba],
    has: {
        type: BooleanType,
        overloads: [
            [
                [StringType],
                (ctx, [key]) => has(key.evaluate(ctx), ctx.properties())
            ],
            [
                [StringType, ObjectType],
                (ctx, [key, obj]) => has(key.evaluate(ctx), obj.evaluate(ctx))
            ]
        ]
    },
    get: {
        type: ValueType,
        overloads: [
            [
                [StringType],
                (ctx, [key]) => get(key.evaluate(ctx), ctx.properties())
            ],
            [
                [StringType, ObjectType],
                (ctx, [key, obj]) => get(key.evaluate(ctx), obj.evaluate(ctx))
            ]
        ]
    },
    'feature-state': [
        ValueType,
        [StringType],
        (ctx, [key]) => get(key.evaluate(ctx), ctx.featureState || {})
    ],
    properties: [ObjectType, [], (ctx) => ctx.properties()],
    'geometry-type': [StringType, [], (ctx) => ctx.geometryType()],
    id: [ValueType, [], (ctx) => ctx.id()],
    zoom: [NumberType, [], (ctx) => ctx.globals.zoom],
    'heatmap-density': [
        NumberType,
        [],
        (ctx) => ctx.globals.heatmapDensity || 0
    ],
    'line-progress': [NumberType, [], (ctx) => ctx.globals.lineProgress || 0],
    accumulated: [
        ValueType,
        [],
        (ctx) =>
            ctx.globals.accumulated === undefined ?
                null :
                ctx.globals.accumulated
    ],
    '+': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => {
            let result = 0;
            for (const arg of args) {
                result += arg.evaluate(ctx);
            }
            return result;
        }
    ],
    '*': [
        NumberType,
        varargs(NumberType),
        (ctx, args) => {
            let result = 1;
            for (const arg of args) {
                result *= arg.evaluate(ctx);
            }
            return result;
        }
    ],
    '-': {
        type: NumberType,
        overloads: [
            [
                [NumberType, NumberType],
                (ctx, [a, b]) => a.evaluate(ctx) - b.evaluate(ctx)
            ],
            [[NumberType], (ctx, [a]) => -a.evaluate(ctx)]
        ]
    },
    '/': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [a, b]) => a.evaluate(ctx) / b.evaluate(ctx)
    ],
    '%': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [a, b]) => a.evaluate(ctx) % b.evaluate(ctx)
    ],
    ln2: [NumberType, [], () => Math.LN2],
    pi: [NumberType, [], () => Math.PI],
    e: [NumberType, [], () => Math.E],
    '^': [
        NumberType,
        [NumberType, NumberType],
        (ctx, [b, e]) => Math.pow(b.evaluate(ctx), e.evaluate(ctx))
    ],
    sqrt: [NumberType, [NumberType], (ctx, [x]) => Math.sqrt(x.evaluate(ctx))],
    log10: [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN10
    ],
    ln: [NumberType, [NumberType], (ctx, [n]) => Math.log(n.evaluate(ctx))],
    log2: [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.log(n.evaluate(ctx)) / Math.LN2
    ],
    sin: [NumberType, [NumberType], (ctx, [n]) => Math.sin(n.evaluate(ctx))],
    cos: [NumberType, [NumberType], (ctx, [n]) => Math.cos(n.evaluate(ctx))],
    tan: [NumberType, [NumberType], (ctx, [n]) => Math.tan(n.evaluate(ctx))],
    asin: [NumberType, [NumberType], (ctx, [n]) => Math.asin(n.evaluate(ctx))],
    acos: [NumberType, [NumberType], (ctx, [n]) => Math.acos(n.evaluate(ctx))],
    atan: [NumberType, [NumberType], (ctx, [n]) => Math.atan(n.evaluate(ctx))],
    min: [
        NumberType,
        varargs(NumberType),
        (ctx, args) => Math.min(...args.map((arg) => arg.evaluate(ctx)))
    ],
    max: [
        NumberType,
        varargs(NumberType),
        (ctx, args) => Math.max(...args.map((arg) => arg.evaluate(ctx)))
    ],
    abs: [NumberType, [NumberType], (ctx, [n]) => Math.abs(n.evaluate(ctx))],
    round: [
        NumberType,
        [NumberType],
        (ctx, [n]) => {
            const v = n.evaluate(ctx);
            // Javascript's Math.round() rounds towards +Infinity for halfway
            // values, even when they're negative. It's more common to round
            // away from 0 (e.g., this is what python and C++ do)
            return v < 0 ? -Math.round(-v) : Math.round(v);
        }
    ],
    floor: [
        NumberType,
        [NumberType],
        (ctx, [n]) => Math.floor(n.evaluate(ctx))
    ],
    ceil: [NumberType, [NumberType], (ctx, [n]) => Math.ceil(n.evaluate(ctx))],
    'filter-==': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => ctx.properties()[k.value] === v.value
    ],
    'filter-id-==': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => ctx.id() === v.value
    ],
    'filter-type-==': [
        BooleanType,
        [StringType],
        (ctx, [v]) => ctx.geometryType() === v.value
    ],
    'filter-<': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a < b;
        }
    ],
    'filter-id-<': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a < b;
        }
    ],
    'filter->': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a > b;
        }
    ],
    'filter-id->': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a > b;
        }
    ],
    'filter-<=': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a <= b;
        }
    ],
    'filter-id-<=': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a <= b;
        }
    ],
    'filter->=': [
        BooleanType,
        [StringType, ValueType],
        (ctx, [k, v]) => {
            const a = ctx.properties()[k.value];
            const b = v.value;
            return typeof a === typeof b && a >= b;
        }
    ],
    'filter-id->=': [
        BooleanType,
        [ValueType],
        (ctx, [v]) => {
            const a = ctx.id();
            const b = v.value;
            return typeof a === typeof b && a >= b;
        }
    ],
    'filter-has': [
        BooleanType,
        [ValueType],
        (ctx, [k]) => k.value in ctx.properties()
    ],
    'filter-has-id': [
        BooleanType,
        [],
        (ctx) => ctx.id() !== null && ctx.id() !== undefined
    ],
    'filter-type-in': [
        BooleanType,
        [array(StringType)],
        (ctx, [v]) => v.value.indexOf(ctx.geometryType()) >= 0
    ],
    'filter-id-in': [
        BooleanType,
        [array(ValueType)],
        (ctx, [v]) => v.value.indexOf(ctx.id()) >= 0
    ],
    'filter-in-small': [
        BooleanType,
        [StringType, array(ValueType)],
        // assumes v is an array literal
        (ctx, [k, v]) => v.value.indexOf(ctx.properties()[k.value]) >= 0
    ],
    'filter-in-large': [
        BooleanType,
        [StringType, array(ValueType)],
        // assumes v is a array literal with values sorted in ascending order and of a single type
        (ctx, [k, v]) =>
            binarySearch(
                ctx.properties()[k.value],
                v.value,
                0,
                v.value.length - 1
            )
    ],
    all: {
        type: BooleanType,
        overloads: [
            [
                [BooleanType, BooleanType],
                (ctx, [a, b]) => a.evaluate(ctx) && b.evaluate(ctx)
            ],
            [
                varargs(BooleanType),
                (ctx, args) => {
                    for (const arg of args) {
                        if (!arg.evaluate(ctx)) return false;
                    }
                    return true;
                }
            ]
        ]
    },
    any: {
        type: BooleanType,
        overloads: [
            [
                [BooleanType, BooleanType],
                (ctx, [a, b]) => a.evaluate(ctx) || b.evaluate(ctx)
            ],
            [
                varargs(BooleanType),
                (ctx, args) => {
                    for (const arg of args) {
                        if (arg.evaluate(ctx)) return true;
                    }
                    return false;
                }
            ]
        ]
    },
    '!': [BooleanType, [BooleanType], (ctx, [b]) => !b.evaluate(ctx)],
    'is-supported-script': [
        BooleanType,
        [StringType],
        // At parse time this will always return true, so we need to exclude this expression with isGlobalPropertyConstant
        (ctx, [s]) => {
            const isSupportedScript =
                ctx.globals && ctx.globals.isSupportedScript;
            if (isSupportedScript) {
                return isSupportedScript(s.evaluate(ctx));
            }
            return true;
        }
    ],
    upcase: [
        StringType,
        [StringType],
        (ctx, [s]) => s.evaluate(ctx).toUpperCase()
    ],
    downcase: [
        StringType,
        [StringType],
        (ctx, [s]) => s.evaluate(ctx).toLowerCase()
    ],
    concat: [
        StringType,
        varargs(ValueType),
        (ctx, args) =>
            args.map((arg) => valueToString(arg.evaluate(ctx))).join('')
    ],
    'resolved-locale': [
        StringType,
        [CollatorType],
        (ctx, [collator]) => collator.evaluate(ctx).resolvedLocale()
    ]
});

const comparisonSignatures = [
    {
        type: 'boolean',
        parameters: ['value', 'value']
    },
    {
        type: 'boolean',
        parameters: ['value', 'value', 'collator']
    }
];

export const types = {
    '==': comparisonSignatures,
    '!=': comparisonSignatures,
    '<': comparisonSignatures,
    '<=': comparisonSignatures,
    '>': comparisonSignatures,
    '>=': comparisonSignatures,
    string: [
        {
            type: 'string',
            parameters: ['value']
        },
        {
            type: 'string',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    number: [
        {
            type: 'number',
            parameters: ['value']
        },
        {
            type: 'number',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    boolean: [
        {
            type: 'boolean',
            parameters: ['value']
        },
        {
            type: 'boolean',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    array: [
        {
            type: 'array',
            parameters: ['value']
        },
        {
            type: 'array<type>',
            parameters: ['type: "string" | "number" | "boolean"', 'value']
        },
        {
            type: 'array<type, N>',
            parameters: [
                'type: "string" | "number" | "boolean"',
                'N: number (literal)',
                'value'
            ]
        }
    ],
    image: [
        {
            type: 'image',
            parameters: ['value']
        }
    ],
    object: [
        {
            type: 'object',
            parameters: ['value']
        },
        {
            type: 'object',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    'to-boolean': [
        {
            type: 'boolean',
            parameters: ['value']
        }
    ],
    'to-color': [
        {
            type: 'color',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    'to-number': [
        {
            type: 'number',
            parameters: ['value', {repeat: ['fallback: value']}]
        }
    ],
    'to-string': [
        {
            type: 'string',
            parameters: ['value']
        }
    ],
    at: [
        {
            type: 'ItemType',
            parameters: ['number', 'array']
        }
    ],
    in: [
        {
            type: 'boolean',
            parameters: [
                'keyword: InputType (boolean, string, or number)',
                'input: InputType (array or string)'
            ]
        }
    ],
    'index-of': [
        {
            type: 'number',
            parameters: [
                'keyword: InputType (boolean, string, or number)',
                'input: InputType (array or string)'
            ]
        },
        {
            type: 'number',
            parameters: [
                'keyword: InputType (boolean, string, or number)',
                'input: InputType (array or string)',
                'index: number'
            ]
        }
    ],
    slice: [
        {
            type: 'OutputType (ItemType or string)',
            parameters: ['input: InputType (array or string)', 'index: number']
        },
        {
            type: 'OutputType (ItemType or string)',
            parameters: [
                'input: InputType (array or string)',
                'index: number',
                'index: number'
            ]
        }
    ],
    case: [
        {
            type: 'OutputType',
            parameters: [
                'condition: boolean, output: OutputType',
                'condition: boolean, output: OutputType',
                '...',
                'fallback: OutputType'
            ]
        }
    ],
    coalesce: [
        {
            type: 'OutputType',
            parameters: [{repeat: ['OutputType']}]
        }
    ],
    step: [
        {
            type: 'OutputType',
            parameters: [
                'input: number',
                'stop_output_0: OutputType',
                'stop_input_1: number, stop_output_1: OutputType',
                'stop_input_n: number, stop_output_n: OutputType, ...'
            ]
        }
    ],
    interpolate: [
        {
            type: 'OutputType (number, array<number>, or Color)',
            parameters: [
                'interpolation: ["linear"] | ["exponential", base] | ["cubic-bezier", x1, y1, x2, y2]',
                'input: number',
                'stop_input_1: number, stop_output_1: OutputType',
                'stop_input_n: number, stop_output_n: OutputType, ...'
            ]
        }
    ],
    'interpolate-hcl': [
        {
            type: 'Color',
            parameters: [
                'interpolation: ["linear"] | ["exponential", base] | ["cubic-bezier", x1, y1, x2, y2]',
                'input: number',
                'stop_input_1: number, stop_output_1: Color',
                'stop_input_n: number, stop_output_n: Color, ...'
            ]
        }
    ],
    'interpolate-lab': [
        {
            type: 'Color',
            parameters: [
                'interpolation: ["linear"] | ["exponential", base] | ["cubic-bezier", x1, y1, x2, y2 ]',
                'input: number',
                'stop_input_1: number, stop_output_1: Color',
                'stop_input_n: number, stop_output_n: Color, ...'
            ]
        }
    ],
    length: [
        {
            type: 'number',
            parameters: ['string | array | value']
        }
    ],
    let: [
        {
            type: 'OutputType',
            parameters: [
                {repeat: ['string (alphanumeric literal)', 'any']},
                'OutputType'
            ]
        }
    ],
    literal: [
        {
            type: 'array<T, N>',
            parameters: ['[...] (JSON array literal)']
        },
        {
            type: 'object',
            parameters: ['{...} (JSON object literal)']
        }
    ],
    match: [
        {
            type: 'OutputType',
            parameters: [
                'input: InputType (number or string)',
                'label: InputType | [InputType, InputType, ...], output: OutputType',
                'label: InputType | [InputType, InputType, ...], output: OutputType',
                '...',
                'fallback: OutputType'
            ]
        }
    ],
    var: [
        {
            type: 'the type of the bound expression',
            parameters: ['previously bound variable name']
        }
    ],
    within: [
        {
            type: 'boolean',
            parameters: ['object']
        }
    ],
    distance: [
        {
            type: 'number',
            parameters: ['object']
        }
    ],
    collator: [
        {
            type: 'collator',
            parameters: [
                '{ "case-sensitive": boolean, "diacritic-sensitive": boolean, "locale": string }'
            ]
        }
    ],
    format: [
        {
            type: 'formatted',
            parameters: [
                // Use backticks to avoid breaking eslint for array<string>
                'input_1: string | image, options_1: { "font-scale": number, "text-font": array<string>, "text-color": color }',
                '...',
                'input_n: string | image, options_n: { "font-scale": number, "text-font": array<string>, "text-color": color }'
            ]
        }
    ],
    'number-format': [
        {
            type: 'string',
            parameters: [
                'input: number',
                'options: { "locale": string, "currency": string, "min-fraction-digits": number, "max-fraction-digits": number }'
            ]
        }
    ]
};

for (const name in CompoundExpression.definitions) {
    if (/^filter-/.test(name)) {
        continue;
    }
    const definition = CompoundExpression.definitions[name];
    if (Array.isArray(definition)) {
        types[name] = [
            {
                type: toString(definition[0]),
                parameters: processParameters(definition[1])
            }
        ];
    } else {
        types[name] = definition.overloads.map((o) => ({
            type: toString(definition.type),
            parameters: processParameters(o[0])
        }));
    }
}

delete types['error'];

function processParameters(params) {
    if (Array.isArray(params)) {
        return params.map(toString);
    } else {
        return [{repeat: [toString(params.type)]}];
    }
}

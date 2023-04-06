import {toString} from '../../../src/expression/types';
import CompoundExpression from '../../../src/expression/compound_expression';

// registers compound expressions
import '../../../src/expression/definitions/index';

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

import {createExpression} from '..';
import {findGlobalStateExpressionKeys} from './validate_global_state_expression';

test('findGlobalStateExpressionKeys extracts all global state keys', () => {
    const expression = [
        "all",
        [">=", ["get", "max_power"], ["global-state", "ev_preferred_power"]],
        [
          "case",
            [
                "in",
                null,
                ["global-state", "ev_preferred_cpo"]
            ],
            true,
            [
                "in",
                ["get", "brand"],
                ["global-state", "ev_preferred_cpo"]
            ]
        ],
        [
            "case",
            [
                "in",
                null,
                ["global-state", "ev_preferred_connector_type"]
            ],
            true,
            [
                "in",
                ["get", "connector_type"],
                ["global-state", "ev_preferred_connector_type"]
            ]
        ],
        [
            "case",
            [
                "in",
                null,
                ["global-state", "ev_preferred_emsp"]
            ],
            true,
            [
                "in",
                ["get", "payment_type"],
                ["global-state", "ev_preferred_emsp"]
            ]
        ]
    ];

    const parsedExpression = createExpression(expression);

    if (parsedExpression.result === 'error') {
        throw new Error(`Error parsing expression: ${expression}. Details: ${JSON.stringify(parsedExpression.value)}`);
    }

    const expectedResults = new Set<string>([
        'ev_preferred_power',
        'ev_preferred_cpo',
        'ev_preferred_connector_type',
        'ev_preferred_emsp',
    ]);

    const results = new Set<string>();
    findGlobalStateExpressionKeys(parsedExpression.value.expression, results);

    expect(results).toEqual(expectedResults);
});

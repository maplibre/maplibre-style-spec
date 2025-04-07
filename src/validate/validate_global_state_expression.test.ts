import {createExpression} from '..';
import {validateGlobalStateExpression} from './validate_global_state_expression';

describe('validateGlobalStateExpression', () => {
    const expression = [
        'all',
        ['>=', ['get', 'max_power'], ['global-state', 'ev_preferred_power']],
        [
            'case',
            [
                'in',
                null,
                ['global-state', 'ev_preferred_cpo']
            ],
            true,
            [
                'in',
                ['get', 'brand'],
                ['global-state', 'ev_preferred_cpo']
            ]
        ],
        [
            'case',
            [
                'in',
                null,
                ['global-state', 'ev_preferred_connector_type']
            ],
            true,
            [
                'in',
                ['get', 'connector_type'],
                ['global-state', 'ev_preferred_connector_type']
            ]
        ],
        [
            'case',
            [
                'in',
                null,
                ['global-state', 'ev_preferred_emsp']
            ],
            true,
            [
                'in',
                ['get', 'payment_type'],
                ['global-state', 'ev_preferred_emsp']
            ]
        ]
    ];

    test('should return no errors if all global state keys are defined', () => {
        const style = {
            version: 8,
            state: {
                ev_preferred_power: 10,
                ev_preferred_cpo: ['cpo1', 'cpo2'],
                ev_preferred_connector_type: ['type1', 'type2'],
                ev_preferred_emsp: ['emsp1', 'emsp2']
            },
            sources: {},
            layers: []
        };

        const parsedExpression = createExpression(expression);

        if (parsedExpression.result === 'error') {
            fail('Expression parsing failed');
        }

        const errors = validateGlobalStateExpression(parsedExpression.value.expression, {style});

        expect(errors).toHaveLength(0);
    });

    test('should return errors if global state keys are not defined', () => {
       
        const parsedExpression = createExpression(expression);

        const style = {
            version: 8,
            state: {},
            sources: {},
            layers: []
        };

        if (parsedExpression.result === 'error') {
            fail('Expression parsing failed');
        }

        const errors = validateGlobalStateExpression(parsedExpression.value.expression, {style});

        expect(errors).toEqual([{
            message: 'required "global-state" key "ev_preferred_power" is not defined in the style state property.'
        }, {
            message: 'required "global-state" key "ev_preferred_cpo" is not defined in the style state property.'
        }, {
            message: 'required "global-state" key "ev_preferred_connector_type" is not defined in the style state property.'
        }, {
            message: 'required "global-state" key "ev_preferred_emsp" is not defined in the style state property.'
        }]);
    });
});

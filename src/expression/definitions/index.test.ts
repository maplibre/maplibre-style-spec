import {describe, expect, test} from 'vitest';

import {expressions} from './index';
import {compoundExpressionDefinitions} from '../compound_expression';

describe('expression registry', () => {
    test('is fully populated by importing it alone', () => {
        // The registry has to be built by its own module rather than by a
        // top-level side effect somewhere else. If some other module has to be
        // pulled in to finish populating it, a bundler that drops that module
        // as unused leaves consumers with a silently half-filled registry.
        for (const name in compoundExpressionDefinitions) {
            expect(expressions).toHaveProperty(name);
        }
        expect(expressions).toHaveProperty('get');
        expect(expressions).toHaveProperty('+');
    });
});

import {derefLayers} from './deref';
import {describe, test, expect} from 'vitest';

describe('deref', () => {
    test('derefs a ref layer which follows its parent', () => {
        expect(derefLayers([
            {
                'id': 'parent',
                'type': 'line'
            },
            {
                'id': 'child',
                'ref': 'parent'
            }
        ])).toEqual([
            {
                'id': 'parent',
                'type': 'line'
            },
            {
                'id': 'child',
                'type': 'line'
            }
        ]);
    });

    test('derefs a ref layer which precedes its parent', () => {
        expect(derefLayers([
            {
                'id': 'child',
                'ref': 'parent'
            },
            {
                'id': 'parent',
                'type': 'line'
            }
        ])).toEqual([
            {
                'id': 'child',
                'type': 'line'
            },
            {
                'id': 'parent',
                'type': 'line'
            }
        ]);
    });
});

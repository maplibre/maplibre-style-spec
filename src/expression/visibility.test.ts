import createVisibilityExpression from './visibility';
import {describe, test, expect, vi, beforeEach, afterEach, type MockInstance} from 'vitest';

let warnSpy: MockInstance;
beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
    warnSpy.mockRestore();
});

describe('create visibility expression', () => {
    test('throws Error for invalid function', () => {
        expect(() =>
            createVisibilityExpression(['bla'] as any, 'layers[0].layout.visibility', {})
        ).toThrow(
            'Unknown expression "bla". If you wanted a literal array, use ["literal", [...]].'
        );
    });
});

describe('evaluate visibility expression', () => {
    test('literal value none', () => {
        const value = createVisibilityExpression('none', 'layers[0].layout.visibility', {});
        expect(value.evaluate()).toBe('none');
        expect(value.getGlobalStateRefs().size).toBe(0);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('literal value visible', () => {
        const value = createVisibilityExpression('visible', 'layers[0].layout.visibility', {});
        expect(value.evaluate()).toBe('visible');
        expect(value.getGlobalStateRefs().size).toBe(0);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state property set to none', () => {
        const globalState: Record<string, any> = {};
        const value = createVisibilityExpression(
            ['global-state', 'x'],
            'layers[0].layout.visibility',
            globalState
        );

        globalState.x = 'none';
        expect(value.evaluate()).toBe('none');
        expect(value.getGlobalStateRefs().has('x')).toBe(true);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state property set to visible', () => {
        const globalState: Record<string, any> = {};
        const value = createVisibilityExpression(
            ['global-state', 'x'],
            'layers[0].layout.visibility',
            globalState
        );

        globalState.x = 'visible';
        expect(value.evaluate()).toBe('visible');
        expect(value.getGlobalStateRefs().has('x')).toBe(true);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state flag set to false', () => {
        const globalState: Record<string, any> = {};
        const value = createVisibilityExpression(
            ['case', ['global-state', 'x'], 'visible', 'none'],
            'layers[0].layout.visibility',
            globalState
        );

        globalState.x = false;
        expect(value.evaluate()).toBe('none');
        expect(value.getGlobalStateRefs().has('x')).toBe(true);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state flag set to true', () => {
        const globalState: Record<string, any> = {};
        const value = createVisibilityExpression(
            ['case', ['global-state', 'x'], 'visible', 'none'],
            'layers[0].layout.visibility',
            globalState
        );

        globalState.x = true;
        expect(value.evaluate()).toBe('visible');
        expect(value.getGlobalStateRefs().has('x')).toBe(true);
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('falls back to default for invalid expression with zoom', () => {
        const value = createVisibilityExpression(
            ['case', ['==', ['zoom'], 5], 'none', 'visible'],
            'layers[0].layout.visibility',
            {}
        );

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('warns and falls back to default for invalid expression with feature', () => {
        const value = createVisibilityExpression(['get', 'x'], 'layers[0].layout.visibility', {});

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].layout.visibility: Expected value to be of type string, but found null instead. Falling back to visible.'
        );
    });

    test('warns and falls back to default for invalid expression with feature state', () => {
        const value = createVisibilityExpression(
            ['feature-state', 'x'],
            'layers[0].layout.visibility',
            {}
        );

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].layout.visibility: Expected value to be of type string, but found null instead. Falling back to visible.'
        );
    });

    test('warns and falls back to default for missing global property', () => {
        const value = createVisibilityExpression(
            ['global-state', 'x'],
            'layers[0].layout.visibility',
            {}
        );

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].layout.visibility: Expected value to be of type string, but found null instead. Falling back to visible.'
        );
    });

    test('warns and falls back to default for invalid global property', () => {
        const value = createVisibilityExpression(
            ['global-state', 'x'],
            'layers[0].layout.visibility',
            {x: 'invalid'}
        );

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
            'layers[0].layout.visibility: Expected value to be one of "visible", "none", but found "invalid" instead. Falling back to visible.'
        );
    });
});

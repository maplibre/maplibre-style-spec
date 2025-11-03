import createVisibilityExpression from './visibility';
import {describe, test, expect, vi} from 'vitest';

describe('evaluate visibility expression', () => {
    test('literal values', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(createVisibilityExpression('none', {}).evaluate()).toBe('none');
        expect(console.warn).not.toHaveBeenCalled();

        expect(createVisibilityExpression('visible', {}).evaluate()).toBe('visible');
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state property as visibility expression', () => {
        const globalState = {};
        const value = createVisibilityExpression(['global-state', 'x'], globalState);

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        globalState.x = 'none';
        expect(value.evaluate()).toBe('none');
        expect(console.warn).not.toHaveBeenCalled();

        globalState.x = 'visible';
        expect(value.evaluate()).toBe('visible');
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('global state flag as visibility expression', () => {
        const globalState = {};
        const value = createVisibilityExpression(['case', ['global-state', 'x'], 'visible', 'none'], globalState);

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        globalState.x = false;
        expect(value.evaluate()).toBe('none');
        expect(console.warn).not.toHaveBeenCalled();

        globalState.x = true;
        expect(value.evaluate()).toBe('visible');
        expect(console.warn).not.toHaveBeenCalled();
    });

    test('warns and falls back to default for invalid expression', () => {
        const value = createVisibilityExpression(['get', 'x'], {});

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledWith('Expected value to be of type string, but found null instead.');
    });

    test('warns and falls back to default for missing global property', () => {
        const value = createVisibilityExpression(['global-state', 'x'], {});

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledWith('Expected value to be of type string, but found null instead.');
    });

    test('warns and falls back to default for invalid global property', () => {
        const value = createVisibilityExpression(['global-state', 'x'], {x: 'invalid'});

        vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(value.evaluate()).toBe('visible');
        expect(console.warn).toHaveBeenCalledWith('Expected value to be one of "visible", "none", but found "invalid" instead.');
    });
});

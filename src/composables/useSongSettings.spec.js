/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useSongSettings } from './useSongSettings';

describe('useSongSettings', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('initializes with default font size (0) when storage is empty', () => {
        const { fontSizeLevel } = useSongSettings();
        expect(fontSizeLevel.value).toBe(0);
    });

    it('initializes with saved font size from localStorage', () => {
        localStorage.setItem('bcasongs_fontSizeLevel', '2');
        const { fontSizeLevel } = useSongSettings();
        expect(fontSizeLevel.value).toBe(2);
    });

    it('persists font size to localStorage when changed', async () => {
        const { fontSizeLevel, cycleFontSize } = useSongSettings();

        expect(fontSizeLevel.value).toBe(0);

        cycleFontSize(); // 0 -> 1
        await nextTick();

        expect(fontSizeLevel.value).toBe(1);
        expect(localStorage.getItem('bcasongs_fontSizeLevel')).toBe('1');

        cycleFontSize(); // 1 -> 2
        await nextTick();

        expect(localStorage.getItem('bcasongs_fontSizeLevel')).toBe('2');
    });

    it('cycles font size correctly: 0 -> 1 -> 2 -> 0', () => {
        const { fontSizeLevel, cycleFontSize } = useSongSettings();

        expect(fontSizeLevel.value).toBe(0);
        cycleFontSize();
        expect(fontSizeLevel.value).toBe(1);
        cycleFontSize();
        expect(fontSizeLevel.value).toBe(2);
        cycleFontSize();
        expect(fontSizeLevel.value).toBe(0);
    });

    it('returns the correct fontSizeClass for each level', () => {
        const { fontSizeClass, cycleFontSize } = useSongSettings();

        expect(fontSizeClass.value).toBe('lyrics-text-1');
        cycleFontSize();
        expect(fontSizeClass.value).toBe('lyrics-text-2');
        cycleFontSize();
        expect(fontSizeClass.value).toBe('lyrics-text-3');
    });
});

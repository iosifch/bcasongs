import { ref, watch, computed } from 'vue';

const STORAGE_KEY_FONT_SIZE = 'bcasongs_fontSizeLevel';

export function useSongSettings() {
    // Initialize from localStorage or default to 0
    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    const fontSizeLevel = ref(savedFontSize ? parseInt(savedFontSize, 10) : 0);

    const fontSizes = ['lyrics-text-1', 'lyrics-text-2', 'lyrics-text-3'];

    const fontSizeClass = computed(() => fontSizes[fontSizeLevel.value]);

    // Persist to localStorage whenever fontSizeLevel changes
    watch(fontSizeLevel, (newValue) => {
        localStorage.setItem(STORAGE_KEY_FONT_SIZE, newValue.toString());
    });

    const cycleFontSize = () => {
        fontSizeLevel.value = (fontSizeLevel.value + 1) % fontSizes.length;
    };

    return {
        fontSizeLevel,
        fontSizeClass,
        cycleFontSize
    };
}

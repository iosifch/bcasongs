import { ref, computed } from 'vue';

const currentSong = ref(null);
const isEditMode = ref(false);

export function useCurrentSong() {
    const setCurrentSong = (song) => {
        currentSong.value = song;
        isEditMode.value = false; // Reset edit mode when song changes
    };

    const clearCurrentSong = () => {
        currentSong.value = null;
        isEditMode.value = false;
    };

    const toggleEditMode = () => {
        isEditMode.value = !isEditMode.value;
    };

    return {
        currentSong: computed(() => currentSong.value),
        isEditMode: computed(() => isEditMode.value),
        setCurrentSong,
        clearCurrentSong,
        toggleEditMode,
        rawIsEditMode: isEditMode // Exposed for v-model binding if needed
    };
}

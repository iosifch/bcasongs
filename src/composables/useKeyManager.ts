import { ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import type { Song } from '../services/SongsRepository';

export function useKeyManager(songRef: Ref<Song | null>, snackbarText: Ref<string>, snackbar: Ref<boolean>) {
  const route = useRoute();
  const keyDialog = ref(false);
  const selectedRoot = ref('C');
  const selectedAccidental = ref('');
  const selectedQuality = ref('');

  const openKeyDialog = (): void => {
    if (!songRef.value) return;

    const currentKey = songRef.value.originalKey || 'C';
    const match = currentKey.match(/^([A-G])([#b]?)(m?)$/);
    if (match) {
      selectedRoot.value = match[1];
      selectedAccidental.value = match[2];
      selectedQuality.value = match[3];
    }

    keyDialog.value = true;
  };

  const saveKeyChange = async (): Promise<void> => {
    const newKey = `${selectedRoot.value}${selectedAccidental.value}${selectedQuality.value}`;

    try {
      if (route.params.id !== 'new' && songRef.value?.id) {
        await SongsRepository.save(songRef.value.id, songRef.value.content, null, newKey);
      }
      if (songRef.value) {
        songRef.value.originalKey = newKey;
      }
      keyDialog.value = false;
      snackbarText.value = 'Key changed successfully';
      snackbar.value = true;
    } catch (error) {
      console.error('Failed to change key:', error);
      snackbarText.value = 'Error changing key';
      snackbar.value = true;
    }
  };

  return {
    keyDialog,
    selectedRoot,
    selectedAccidental,
    selectedQuality,
    openKeyDialog,
    saveKeyChange
  };
}

import { ref } from 'vue';
import { useRoute } from 'vue-router';
import SongsRepository from '../services/SongsRepository';

export function useKeyManager(songRef, snackbarText, snackbar) {
  const route = useRoute();
  const keyDialog = ref(false);
  const selectedRoot = ref('C');
  const selectedAccidental = ref('');
  const selectedQuality = ref('');

  const openKeyDialog = () => {
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

  const saveKeyChange = async () => {
    const newKey = `${selectedRoot.value}${selectedAccidental.value}${selectedQuality.value}`;
    
    try {
      if (route.params.id !== 'new' && songRef.value.id) {
        await SongsRepository.save(songRef.value.id, songRef.value.content, null, newKey);
      }
      songRef.value.originalKey = newKey;
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

import { ref, onMounted } from 'vue';
import SongsRepository from '../services/SongsRepository';

export function useCurrentSong(songId, onSongResolved) {
  const song = ref(null);
  const loading = ref(true);

  onMounted(async () => {
    if (songId === 'new') {
      song.value = {
        title: '',
        content: '',
        originalKey: null
      };
      if (onSongResolved) onSongResolved(song.value);
      loading.value = false;
      return;
    }

    const found = await SongsRepository.getSong(songId);
    if (found) {
      song.value = found;
      if (onSongResolved) onSongResolved(song.value);
    }
    loading.value = false;
  });

  return {
    song,
    loading
  };
}

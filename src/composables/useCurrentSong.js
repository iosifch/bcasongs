import { ref, watch, onMounted } from 'vue';
import SongsRepository from '../services/SongsRepository';

export function useCurrentSong(songId, onSongResolved) {
  const song = ref(null);
  const loading = ref(true);

  const resolveSong = () => {
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

    const foundSong = SongsRepository.getSong(songId);
    if (foundSong) {
      song.value = foundSong;
      if (onSongResolved) onSongResolved(song.value);
    }
    loading.value = false;
  };

  onMounted(() => {
    if (!SongsRepository.loading.value) {
      resolveSong();
    } else {
      const stopWatch = watch(
        () => SongsRepository.loading.value,
        (isLoading) => {
          if (!isLoading) {
            resolveSong();
            stopWatch();
          }
        }
      );
    }
  });

  return {
    song,
    loading
  };
}

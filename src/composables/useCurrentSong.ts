import { ref, onMounted } from 'vue';
import SongsRepository from '../services/SongsRepository';
import type { Song } from '../services/SongsRepository';

export function useCurrentSong(songId: string, onSongResolved?: (song: Song) => void) {
  const song = ref<Song | null>(null);
  const loading = ref(true);

  onMounted(async () => {
    if (songId === 'new') {
      song.value = {
        title: '',
        content: '',
        originalKey: null
      } as Song;
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

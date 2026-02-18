import { ref, computed } from 'vue';
import SongsRepository from '../services/SongsRepository';

const search = ref('');

export function useSongs() {
  const songs = computed(() => {
    if (!search.value) return SongsRepository.songs.value;
    const term = search.value.toLowerCase();
    return SongsRepository.songs.value.filter(song =>
      song.title.toLowerCase().includes(term) ||
      song.content.toLowerCase().includes(term)
    );
  });

  const loading = SongsRepository.loading;

  return { songs, search, loading };
}

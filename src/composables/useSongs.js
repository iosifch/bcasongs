import { ref, computed } from 'vue';
import SongsRepository from '../services/SongsRepository';

const search = ref('');

const removeDiacritics = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function useSongs() {
  const songs = computed(() => {
    if (!search.value) return SongsRepository.songs.value;
    const term = removeDiacritics(search.value.toLowerCase());
    return SongsRepository.songs.value.filter(song =>
      removeDiacritics((song.title || '').toLowerCase()).includes(term) ||
      removeDiacritics((song.content || '').toLowerCase()).includes(term)
    );
  });

  const loading = SongsRepository.loading;

  return { songs, search, loading };
}

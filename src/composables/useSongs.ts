import { ref, computed } from 'vue';
import SongsRepository, { removeDiacritics } from '../services/SongsRepository';

const search = ref('');

export function useSongs() {
  const songs = computed(() => {
    if (!search.value) return SongsRepository.songs.value;
    const term = removeDiacritics(search.value.toLowerCase());
    const matchingIds = new Set(
      SongsRepository.searchIndex.value
        .filter(entry => entry.normalizedTitle.includes(term) || entry.normalizedContent.includes(term))
        .map(entry => entry.id)
    );
    return SongsRepository.songs.value.filter(song => matchingIds.has(song.id));
  });

  const loading = SongsRepository.loading;

  return { songs, search, loading };
}

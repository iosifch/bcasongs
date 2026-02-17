import { computed } from 'vue';
import { useSearch } from './useSearch';

export function useSongFiltering(songsRef) {
  const { search } = useSearch();

  const filteredSongs = computed(() => {
    if (!search.value) return songsRef.value;
    const term = search.value.toLowerCase();
    return songsRef.value.filter(song =>
      song.title.toLowerCase().includes(term) ||
      song.content.toLowerCase().includes(term)
    );
  });

  return {
    search,
    filteredSongs
  };
}

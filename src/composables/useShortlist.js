import { ref, watch } from 'vue';

const SHORTLIST_KEY = 'bcasongs_shortlist';

const shortlist = ref(JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]'));

watch(shortlist, (newVal) => {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(newVal));
}, { deep: true });

export function useShortlist() {
  const toggleShortlist = (songId) => {
    const index = shortlist.value.indexOf(songId);
    if (index === -1) {
      shortlist.value.push(songId);
    } else {
      shortlist.value.splice(index, 1);
    }
  };

  const isInShortlist = (songId) => {
    return shortlist.value.includes(songId);
  };

  return {
    shortlist,
    toggleShortlist,
    isInShortlist
  };
}

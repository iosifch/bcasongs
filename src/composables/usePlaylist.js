import { ref, watch } from 'vue';

const PLAYLIST_KEY = 'bcasongs_playlist';

const playlist = ref(JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]'));

watch(playlist, (newVal) => {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(newVal));
}, { deep: true });

export function usePlaylist() {
  const togglePlaylist = (songId) => {
    const index = playlist.value.indexOf(songId);
    if (index === -1) {
      playlist.value.push(songId);
    } else {
      playlist.value.splice(index, 1);
    }
  };

  const isInPlaylist = (songId) => {
    return playlist.value.includes(songId);
  };

  const reorderPlaylist = (newOrderIds) => {
    playlist.value = newOrderIds;
  };

  const replacePlaylist = (newIds) => {
    playlist.value = newIds;
  };

  return {
    playlist,
    togglePlaylist,
    isInPlaylist,
    reorderPlaylist,
    replacePlaylist
  };
}

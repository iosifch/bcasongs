import { computed } from 'vue';
import { usePlaylist } from './usePlaylist';

export function usePlaylistSongs(allSongsRef) {
  const { playlist, reorderPlaylist } = usePlaylist();

  const playlistModel = computed({
    get: () => {
      return playlist.value
        .map(id => allSongsRef.value.find(s => s.id === id))
        .filter(Boolean);
    },
    set: (val) => {
      reorderPlaylist(val.map(s => s.id));
    }
  });

  return {
    playlistModel
  };
}

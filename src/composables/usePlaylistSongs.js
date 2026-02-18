import { ref, computed, watchEffect } from 'vue';
import { usePlaylist } from './usePlaylist';
import SongsRepository from '../services/SongsRepository';

export function usePlaylistSongs() {
  const { playlist, reorderPlaylist } = usePlaylist();
  const playlistSongs = ref([]);
  const loading = ref(false);

  watchEffect(async () => {
    const ids = playlist.value;
    if (ids.length === 0) {
      playlistSongs.value = [];
      return;
    }

    loading.value = true;
    const songs = await Promise.all(
      ids.map(id => SongsRepository.getSong(id))
    );
    playlistSongs.value = songs.filter(Boolean);
    loading.value = false;
  });

  const playlistModel = computed({
    get: () => playlistSongs.value,
    set: (val) => {
      reorderPlaylist(val.map(s => s.id));
    }
  });

  return { playlistModel, loading };
}

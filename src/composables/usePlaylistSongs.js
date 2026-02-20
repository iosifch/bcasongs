import { ref, computed, watch } from 'vue';
import { usePlaylist } from './usePlaylist';
import SongsRepository from '../services/SongsRepository';

export function usePlaylistSongs() {
  const { playlist, reorderPlaylist } = usePlaylist();
  const playlistSongs = ref([]);
  const loading = ref(false);

  let requestId = 0;

  watch(() => playlist.value, async (ids) => {
    if (ids.length === 0) {
      playlistSongs.value = [];
      loading.value = false;
      return;
    }

    const currentRequest = ++requestId;
    loading.value = true;

    try {
      const songs = await Promise.all(
        ids.map(id => SongsRepository.getSong(id))
      );

      // Ignore stale responses from previous requests
      if (currentRequest !== requestId) return;

      playlistSongs.value = songs.filter(Boolean);
    } catch (error) {
      if (currentRequest !== requestId) return;
      console.error('Error loading playlist songs:', error);
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  }, { immediate: true });

  const playlistModel = computed({
    get: () => playlistSongs.value,
    set: (val) => {
      reorderPlaylist(val.map(s => s.id));
    }
  });

  return { playlistModel, loading };
}

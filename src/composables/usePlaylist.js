import { computed } from 'vue';
import PlaylistRepository from '../services/PlaylistRepository';

export function usePlaylist() {
  const playlist = computed(() => PlaylistRepository.songIds.value);

  const togglePlaylist = async (songId) => {
    if (PlaylistRepository.containsSong(songId)) {
      await PlaylistRepository.removeSongFromPlaylist(songId);
    } else {
      await PlaylistRepository.addSongToPlaylist(songId);
    }
  };

  const isInPlaylist = (songId) => {
    return PlaylistRepository.containsSong(songId);
  };

  const reorderPlaylist = async (newOrderIds) => {
    await PlaylistRepository.reorderSongsInPlaylist(newOrderIds);
  };

  const replacePlaylist = async (newIds) => {
    await PlaylistRepository.replaceAllSongsInPlaylist(newIds);
  };

  return {
    playlist,
    loading: PlaylistRepository.loading,
    error: PlaylistRepository.error,
    togglePlaylist,
    isInPlaylist,
    reorderPlaylist,
    replacePlaylist
  };
}

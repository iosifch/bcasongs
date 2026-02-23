import { computed } from 'vue';
import PlaylistRepository from '../services/PlaylistRepository';

export function usePlaylist() {
  const playlist = computed(() => PlaylistRepository.songIds.value);
  const playlistCount = computed(() => playlist.value.length);

  const togglePlaylist = async (songId: string): Promise<void> => {
    if (PlaylistRepository.containsSong(songId)) {
      await PlaylistRepository.removeSongFromPlaylist(songId);
    } else {
      await PlaylistRepository.addSongToPlaylist(songId);
    }
  };

  const isInPlaylist = (songId: string): boolean => {
    return PlaylistRepository.containsSong(songId);
  };

  const reorderPlaylist = async (newOrderIds: string[]): Promise<void> => {
    await PlaylistRepository.reorderSongsInPlaylist(newOrderIds);
  };

  const replacePlaylist = async (newIds: string[]): Promise<void> => {
    await PlaylistRepository.replaceAllSongsInPlaylist(newIds);
  };

  return {
    playlist,
    playlistCount,
    loading: PlaylistRepository.loading,
    error: PlaylistRepository.error,
    togglePlaylist,
    isInPlaylist,
    reorderPlaylist,
    replacePlaylist
  };
}

import { ref } from 'vue';
import { usePlaylist } from './usePlaylist';
import { useShare } from './useShare';

export function useSongActions() {
  const { isInPlaylist, togglePlaylist } = usePlaylist();
  const { share } = useShare();
  
  const snackbar = ref(false);
  const snackbarText = ref('');

  const handleTogglePlaylist = (songId) => {
    const wasInPlaylist = isInPlaylist(songId);
    togglePlaylist(songId);
    snackbarText.value = wasInPlaylist ? 'Removed from playlist' : 'Added to playlist';
    snackbar.value = true;
  };

  const handleShare = async (song) => {
    if (!song || !song.id) return;
    const url = `${window.location.origin}/song/${song.id}`;
    const result = await share(song.title, url);

    if (result.copied) {
      snackbarText.value = 'Link copied to clipboard';
      snackbar.value = true;
    }
  };

  return {
    snackbar,
    snackbarText,
    handleTogglePlaylist,
    handleShare
  };
}

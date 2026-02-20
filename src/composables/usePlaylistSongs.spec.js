import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick, computed } from 'vue';

const mockGetSong = vi.hoisted(() => vi.fn());
const mockReorderSongsInPlaylist = vi.hoisted(() => vi.fn());

vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: mockGetSong,
    songs: { value: [] },
    loading: { value: false }
  }
}));

// We need a reactive ref for the playlist to trigger the watch inside usePlaylistSongs.
// Since vi.mock is hoisted, we create the ref inside the factory using inline require.
const playlistRef = ref([]);

vi.mock('./usePlaylist', () => ({
  usePlaylist: () => ({
    playlist: computed(() => playlistRef.value),
    playlistCount: computed(() => playlistRef.value.length),
    reorderPlaylist: mockReorderSongsInPlaylist,
    isInPlaylist: (id) => playlistRef.value.includes(id),
    togglePlaylist: vi.fn(),
    replacePlaylist: vi.fn(),
    loading: { value: false },
    error: { value: null }
  })
}));

import { usePlaylistSongs } from './usePlaylistSongs';

describe('usePlaylistSongs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playlistRef.value = [];
    mockGetSong.mockReset();
    mockReorderSongsInPlaylist.mockReset();
  });

  it('should return empty playlist model when no songs in playlist', async () => {
    const { playlistModel } = usePlaylistSongs();
    await nextTick();

    expect(playlistModel.value).toEqual([]);
  });

  it('should load songs for playlist ids', async () => {
    const song1 = { id: 'song1', title: 'Song One', content: 'Lyrics 1' };
    const song2 = { id: 'song2', title: 'Song Two', content: 'Lyrics 2' };
    mockGetSong.mockImplementation((id) => {
      if (id === 'song1') return Promise.resolve(song1);
      if (id === 'song2') return Promise.resolve(song2);
      return Promise.resolve(null);
    });

    playlistRef.value = ['song1', 'song2'];

    const { playlistModel } = usePlaylistSongs();

    await vi.waitFor(() => {
      expect(playlistModel.value).toHaveLength(2);
    });

    expect(playlistModel.value[0].title).toBe('Song One');
    expect(playlistModel.value[1].title).toBe('Song Two');
  });

  it('should filter out null songs (deleted or missing)', async () => {
    mockGetSong.mockImplementation((id) => {
      if (id === 'song1') return Promise.resolve({ id: 'song1', title: 'Song One' });
      return Promise.resolve(null);
    });

    playlistRef.value = ['song1', 'missing-song'];

    const { playlistModel } = usePlaylistSongs();

    await vi.waitFor(() => {
      expect(playlistModel.value).toHaveLength(1);
    });

    expect(playlistModel.value[0].id).toBe('song1');
  });

  it('should set loading to false after songs are loaded', async () => {
    mockGetSong.mockResolvedValue({ id: 'song1', title: 'Song One' });
    playlistRef.value = ['song1'];

    const { playlistModel, loading } = usePlaylistSongs();

    await vi.waitFor(() => {
      expect(playlistModel.value).toHaveLength(1);
    });

    expect(loading.value).toBe(false);
  });

  it('should set loading to false when playlist is empty', async () => {
    playlistRef.value = [];

    const { loading } = usePlaylistSongs();
    await nextTick();

    expect(loading.value).toBe(false);
  });

  it('should handle errors without leaving loading stuck at true', async () => {
    mockGetSong.mockRejectedValue(new Error('Firestore error'));
    playlistRef.value = ['song1'];

    const { loading } = usePlaylistSongs();

    await vi.waitFor(() => {
      expect(loading.value).toBe(false);
    });
  });

  it('should discard stale responses on rapid playlist changes', async () => {
    let resolveSong1;
    const song1Promise = new Promise((resolve) => { resolveSong1 = resolve; });
    const song1 = { id: 'song1', title: 'Song One' };
    const song2 = { id: 'song2', title: 'Song Two' };

    // getSong('song1') will be slow, getSong('song2') will be fast
    mockGetSong.mockImplementation((id) => {
      if (id === 'song1') return song1Promise;
      if (id === 'song2') return Promise.resolve(song2);
      return Promise.resolve(null);
    });

    // Start with empty playlist, mount the composable
    const { playlistModel } = usePlaylistSongs();
    await nextTick();

    // Trigger first request (slow song1)
    playlistRef.value = ['song1'];
    await nextTick();

    // Trigger second request before first resolves (fast song2)
    playlistRef.value = ['song2'];

    // Wait for second (fast) request to complete
    await vi.waitFor(() => {
      expect(playlistModel.value).toHaveLength(1);
    });
    expect(playlistModel.value[0].id).toBe('song2');

    // Now resolve the first (stale) request
    resolveSong1(song1);
    await nextTick();
    await nextTick();

    // Should still show song2, not overwritten by stale song1
    expect(playlistModel.value).toHaveLength(1);
    expect(playlistModel.value[0].id).toBe('song2');
  });

  it('should call reorderPlaylist when setting playlistModel', async () => {
    const song1 = { id: 'song1', title: 'Song One' };
    const song2 = { id: 'song2', title: 'Song Two' };
    mockGetSong.mockImplementation((id) => {
      if (id === 'song1') return Promise.resolve(song1);
      if (id === 'song2') return Promise.resolve(song2);
      return Promise.resolve(null);
    });

    playlistRef.value = ['song1', 'song2'];

    const { playlistModel } = usePlaylistSongs();

    await vi.waitFor(() => {
      expect(playlistModel.value).toHaveLength(2);
    });

    // Simulate drag reorder
    playlistModel.value = [song2, song1];

    expect(mockReorderSongsInPlaylist).toHaveBeenCalledWith(['song2', 'song1']);
  });
});

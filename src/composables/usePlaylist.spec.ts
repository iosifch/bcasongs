import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

const mockSongIds = vi.hoisted(() => ({ value: [] as string[] }));

vi.mock('../services/PlaylistRepository', () => ({
  default: {
    songIds: mockSongIds,
    loading: { value: false },
    error: { value: null },
    containsSong: (id: string) => mockSongIds.value.includes(id),
    addSongToPlaylist: vi.fn(),
    removeSongFromPlaylist: vi.fn(),
    reorderSongsInPlaylist: vi.fn(),
    replaceAllSongsInPlaylist: vi.fn()
  }
}));

import { usePlaylist } from './usePlaylist';
import PlaylistRepository from '../services/PlaylistRepository';

describe('usePlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSongIds.value = [];
  });

  it('should expose playlist as a computed from PlaylistRepository.songIds', () => {
    mockSongIds.value = ['song1', 'song2'];
    const { playlist } = usePlaylist();
    expect(playlist.value).toEqual(['song1', 'song2']);
  });

  it('should call addSongToPlaylist when toggling a song not in playlist', async () => {
    const { togglePlaylist } = usePlaylist();
    await togglePlaylist('song1');
    expect(PlaylistRepository.addSongToPlaylist).toHaveBeenCalledWith('song1');
  });

  it('should call removeSongFromPlaylist when toggling a song already in playlist', async () => {
    mockSongIds.value = ['song1'];
    const { togglePlaylist } = usePlaylist();
    await togglePlaylist('song1');
    expect(PlaylistRepository.removeSongFromPlaylist).toHaveBeenCalledWith('song1');
  });

  it('isInPlaylist should check PlaylistRepository.containsSong', () => {
    mockSongIds.value = ['song1'];
    const { isInPlaylist } = usePlaylist();
    expect(isInPlaylist('song1')).toBe(true);
    expect(isInPlaylist('song2')).toBe(false);
  });

  it('replacePlaylist should call replaceAllSongsInPlaylist', async () => {
    const { replacePlaylist } = usePlaylist();
    await replacePlaylist(['song3', 'song4']);
    expect(PlaylistRepository.replaceAllSongsInPlaylist).toHaveBeenCalledWith(['song3', 'song4']);
  });

  it('reorderPlaylist should call reorderSongsInPlaylist', async () => {
    const { reorderPlaylist } = usePlaylist();
    await reorderPlaylist(['song2', 'song1']);
    expect(PlaylistRepository.reorderSongsInPlaylist).toHaveBeenCalledWith(['song2', 'song1']);
  });

  it('should propagate errors from addSongToPlaylist when toggling', async () => {
    (PlaylistRepository.addSongToPlaylist as Mock).mockRejectedValue(new Error('Firestore error'));

    const { togglePlaylist } = usePlaylist();

    await expect(togglePlaylist('song1')).rejects.toThrow('Firestore error');
  });

  it('should propagate errors from removeSongFromPlaylist when toggling', async () => {
    mockSongIds.value = ['song1'];
    (PlaylistRepository.removeSongFromPlaylist as Mock).mockRejectedValue(new Error('Network error'));

    const { togglePlaylist } = usePlaylist();

    await expect(togglePlaylist('song1')).rejects.toThrow('Network error');
  });
});

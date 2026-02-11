import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlaylist } from './usePlaylist';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('usePlaylist', () => {
  beforeEach(() => {
    localStorage.clear();
    const { playlist } = usePlaylist();
    playlist.value = [];
  });

  it('should add a song to the playlist', () => {
    const { togglePlaylist, isInPlaylist } = usePlaylist();
    
    togglePlaylist('1');
    expect(isInPlaylist('1')).toBe(true);
  });

  it('should remove a song from the playlist if it already exists', () => {
    const { togglePlaylist, isInPlaylist } = usePlaylist();
    
    togglePlaylist('1'); // add
    togglePlaylist('1'); // remove
    expect(isInPlaylist('1')).toBe(false);
  });

  it('should replace the entire playlist', () => {
    const { playlist, replacePlaylist } = usePlaylist();
    
    replacePlaylist(['1', '2', '3']);
    expect(playlist.value).toEqual(['1', '2', '3']);
  });
});

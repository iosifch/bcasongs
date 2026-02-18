import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useSongs } from './useSongs';
import SongsRepository from '../services/SongsRepository';

vi.mock('../services/SongsRepository', () => ({
  default: {
    songs: { value: [] },
    loading: { value: false }
  }
}));

describe('useSongs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.songs.value = [];
    SongsRepository.loading.value = false;
  });

  it('returns all songs when search is empty', () => {
    SongsRepository.songs.value = [
      { id: '1', title: 'Amazing Grace', content: 'How sweet the sound' },
      { id: '2', title: 'Holy Holy', content: 'Holy is the Lord' }
    ];

    const { songs, search } = useSongs();
    search.value = '';

    expect(songs.value).toHaveLength(2);
  });

  it('filters songs by title', () => {
    SongsRepository.songs.value = [
      { id: '1', title: 'Amazing Grace', content: 'How sweet the sound' },
      { id: '2', title: 'Holy Holy', content: 'Holy is the Lord' }
    ];

    const { songs, search } = useSongs();
    search.value = 'amazing';

    expect(songs.value).toHaveLength(1);
    expect(songs.value[0].title).toBe('Amazing Grace');
  });

  it('filters songs by content', () => {
    SongsRepository.songs.value = [
      { id: '1', title: 'Amazing Grace', content: 'How sweet the sound' },
      { id: '2', title: 'Holy Holy', content: 'Holy is the Lord' }
    ];

    const { songs, search } = useSongs();
    search.value = 'sweet';

    expect(songs.value).toHaveLength(1);
    expect(songs.value[0].title).toBe('Amazing Grace');
  });

  it('is case insensitive', () => {
    SongsRepository.songs.value = [
      { id: '1', title: 'Amazing Grace', content: 'lyrics' }
    ];

    const { songs, search } = useSongs();
    search.value = 'AMAZING';

    expect(songs.value).toHaveLength(1);
  });

  it('returns empty array when no songs match', () => {
    SongsRepository.songs.value = [
      { id: '1', title: 'Amazing Grace', content: 'lyrics' }
    ];

    const { songs, search } = useSongs();
    search.value = 'xyz';

    expect(songs.value).toHaveLength(0);
  });

  it('exposes loading from repository', () => {
    SongsRepository.loading.value = true;

    const { loading } = useSongs();

    expect(loading.value).toBe(true);
  });
});

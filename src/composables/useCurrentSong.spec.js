import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { useCurrentSong } from './useCurrentSong';
import SongsRepository from '../services/SongsRepository';
import { mount } from '@vue/test-utils';

vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: vi.fn()
  }
}));

describe('useCurrentSong', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent = (id, callback) => ({
    setup() {
      const { song, loading } = useCurrentSong(id, callback);
      return { song, loading };
    },
    template: '<div></div>'
  });

  it('resolves a new song immediately', async () => {
    const callback = vi.fn();
    const wrapper = mount(TestComponent('new', callback));

    expect(wrapper.vm.song).toEqual({
      title: '',
      content: '',
      originalKey: null
    });
    expect(callback).toHaveBeenCalled();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('resolves an existing song from repository', async () => {
    const mockSong = { id: '1', title: 'Existing' };
    SongsRepository.getSong.mockResolvedValue(mockSong);

    const wrapper = mount(TestComponent('1'));
    await flushPromises();

    expect(wrapper.vm.song).toEqual(mockSong);
    expect(wrapper.vm.loading).toBe(false);
  });

  it('calls onSongResolved callback when song is found', async () => {
    const mockSong = { id: '1', title: 'Found' };
    SongsRepository.getSong.mockResolvedValue(mockSong);
    const callback = vi.fn();

    mount(TestComponent('1', callback));
    await flushPromises();

    expect(callback).toHaveBeenCalledWith(mockSong);
  });

  it('sets loading to false when song is not found', async () => {
    SongsRepository.getSong.mockResolvedValue(null);

    const wrapper = mount(TestComponent('non-existent'));
    await flushPromises();

    expect(wrapper.vm.song).toBeNull();
    expect(wrapper.vm.loading).toBe(false);
  });
});

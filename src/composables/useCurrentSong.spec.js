import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useCurrentSong } from './useCurrentSong';
import SongsRepository from '../services/SongsRepository';
import { mount } from '@vue/test-utils';

vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: vi.fn(),
    loading: ref(false)
  }
}));

describe('useCurrentSong', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.loading.value = false;
  });

  // Helper component to test composable lifecycle
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
    SongsRepository.getSong.mockReturnValue(mockSong);
    
    const wrapper = mount(TestComponent('1'));
    await nextTick();

    expect(wrapper.vm.song).toEqual(mockSong);
    expect(wrapper.vm.loading).toBe(false);
  });

  it('waits for repository loading state', async () => {
    SongsRepository.loading.value = true;
    const mockSong = { id: '1', title: 'Delayed' };
    SongsRepository.getSong.mockReturnValue(mockSong);

    const wrapper = mount(TestComponent('1'));
    
    expect(wrapper.vm.song).toBeNull();
    
    SongsRepository.loading.value = false;
    await nextTick();

    expect(wrapper.vm.song).toEqual(mockSong);
  });
});

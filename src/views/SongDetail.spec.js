import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';

// 1. Mock Composables
vi.mock('../composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: ref(false),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn()
  }))
}));

vi.mock('../composables/usePlaylist', () => ({
  usePlaylist: vi.fn(() => ({
    playlist: ref([]),
    togglePlaylist: vi.fn(),
    isInPlaylist: vi.fn(() => false)
  }))
}));

vi.mock('../composables/useShare', () => ({
  useShare: vi.fn(() => ({
    share: vi.fn()
  }))
}));

vi.mock('../composables/useSongSettings', () => ({
  useSongSettings: vi.fn(() => ({
    fontSizeClass: ref('lyrics-text-1'),
    cycleFontSize: vi.fn()
  }))
}));

vi.mock('../composables/useCurrentSong', () => ({
  useCurrentSong: vi.fn(() => ({
    setCurrentSong: vi.fn(),
    clearCurrentSong: vi.fn(),
    isEditMode: ref(false),
    toggleEditMode: vi.fn()
  }))
}));

// 2. Mock Services
vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: vi.fn(),
    save: vi.fn(),
    loading: ref(false)
  }
}));

vi.mock('../services/LyricsService', () => ({
  default: {
    parseToParagraphs: vi.fn(() => []),
    serialize: vi.fn(() => '')
  }
}));

// 3. Mock Vue Router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: '1' } })),
  useRouter: vi.fn(() => ({ back: vi.fn(), push: vi.fn() }))
}));

// 4. Imports after mocks
import SongDetail from './SongDetail.vue';
import { useAuth } from '../composables/useAuth';
import SongsRepository from '../services/SongsRepository';

// Mock Vuetify Components
const global = {
  stubs: {
    'v-app-bar': { template: '<header><slot /></header>' },
    'v-container': { template: '<div><slot /></div>' },
    'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    'v-icon': { template: '<i><slot /></i>' },
    'v-chip': { template: '<span><slot /></span>' },
    'v-spacer': { template: '<div />' },
    'v-row': { template: '<div><slot /></div>' },
    'v-col': { template: '<div><slot /></div>' },
    'v-progress-circular': { template: '<div />' },
    'v-sheet': { template: '<div><slot /></div>' },
    'v-alert': { template: '<div><slot /></div>' },
    'v-snackbar': { template: '<div><slot /></div>' },
    'v-dialog': { template: '<div><slot v-if="$attrs.modelValue" /></div>' },
    'v-card': { template: '<div><slot /></div>' },
    'v-card-text': { template: '<div><slot /></div>' },
    'v-card-actions': { template: '<div><slot /></div>' },
    'v-select': { template: '<div />' }
  }
};

describe('SongDetail.vue - Key Change', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    originalKey: 'G',
    content: '[G]Test lyrics',
    bookNumber: '123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
  });

  it('shows key as a chip when not authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => false),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, { global });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('G');
    // It should be in a span (v-chip stub)
    const chips = wrapper.findAll('span');
    const keyChip = chips.find(c => c.text() === 'G');
    expect(keyChip).toBeDefined();
    
    // Check it's not a button (v-btn stub is <button>)
    const buttons = wrapper.findAll('button');
    const keyBtn = buttons.find(b => b.text() === 'G');
    expect(keyBtn).toBeUndefined();
  });

  it('shows key as a button when authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, { global });
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const keyBtn = buttons.find(b => b.text() === 'G');
    expect(keyBtn).toBeDefined();
  });

  it('opens dialog when key button is clicked', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, { global });
    await flushPromises();

    expect(wrapper.vm.keyDialog).toBe(false);
    
    const buttons = wrapper.findAll('button');
    const keyBtn = buttons.find(b => b.text() === 'G');
    await keyBtn.trigger('click');

    expect(wrapper.vm.keyDialog).toBe(true);
    expect(wrapper.vm.selectedRoot).toBe('G');
    expect(wrapper.vm.selectedAccidental).toBe('');
    expect(wrapper.vm.selectedQuality).toBe('');
  });

  it('parses complex key correctly when opening dialog', async () => {
    SongsRepository.getSong.mockReturnValue({ ...mockSong, originalKey: 'C#m' });
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, { global });
    await flushPromises();

    await wrapper.vm.openKeyDialog();

    expect(wrapper.vm.selectedRoot).toBe('C');
    expect(wrapper.vm.selectedAccidental).toBe('#');
    expect(wrapper.vm.selectedQuality).toBe('m');
  });

  it('saves new key and updates UI', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });
    SongsRepository.save.mockResolvedValue();

    const wrapper = mount(SongDetail, { global });
    await flushPromises();

    await wrapper.vm.openKeyDialog();
    wrapper.vm.selectedRoot = 'A';
    wrapper.vm.selectedAccidental = 'b';
    wrapper.vm.selectedQuality = 'm';

    await wrapper.vm.saveKeyChange();

    expect(SongsRepository.save).toHaveBeenCalledWith('1', mockSong.content, null, 'Abm');
    expect(wrapper.vm.song.originalKey).toBe('Abm');
    expect(wrapper.vm.keyDialog).toBe(false);
    expect(wrapper.vm.snackbarText).toBe('Key changed successfully');
  });
});

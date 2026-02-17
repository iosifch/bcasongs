import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed, defineComponent, h } from 'vue';
import SongDetail from './SongDetail.vue';
import { useAuth } from '../composables/useAuth';
import { usePlaylist } from '../composables/usePlaylist';
import { useSongSettings } from '../composables/useSongSettings';
import { useSongEditor } from '../composables/useSongEditor';
import { useKeyManager } from '../composables/useKeyManager';
import { useSongActions } from '../composables/useSongActions';
import { VLayout } from 'vuetify/components';
import { vuetify } from '../vitest-setup';

// --- Mocks ---
vi.mock('../firebaseConfig', () => ({
  auth: {},
  googleProvider: {},
  db: {}
}));

vi.mock('../composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: ref(true),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn()
  }))
}));

vi.mock('../composables/usePlaylist', () => ({
  usePlaylist: vi.fn(() => ({
    isInPlaylist: vi.fn(() => false)
  }))
}));

vi.mock('../composables/useSongSettings', () => ({
  useSongSettings: vi.fn(() => ({
    fontSizeClass: ref('lyrics-text-1'),
    cycleFontSize: vi.fn()
  }))
}));

vi.mock('../composables/useSongActions', () => ({
  useSongActions: vi.fn(() => ({
    snackbar: ref(false),
    snackbarText: ref(''),
    handleTogglePlaylist: vi.fn(),
    handleShare: vi.fn()
  }))
}));

vi.mock('../composables/useSongEditor', () => ({
  useSongEditor: vi.fn(() => ({
    isEditMode: ref(false),
    isSaving: ref(false),
    editTitle: ref(''),
    paragraphs: ref([]),
    initializeEditor: vi.fn(),
    addParagraph: vi.fn(),
    removeParagraph: vi.fn(),
    toggleEditMode: vi.fn()
  }))
}));

vi.mock('../composables/useKeyManager', () => ({
  useKeyManager: vi.fn(() => ({
    keyDialog: ref(false),
    selectedRoot: ref('C'),
    selectedAccidental: ref(''),
    selectedQuality: ref(''),
    openKeyDialog: vi.fn(),
    saveKeyChange: vi.fn()
  }))
}));

vi.mock('../composables/useCurrentSong', () => ({
  useCurrentSong: vi.fn(() => ({
    song: ref({ id: '1', title: 'Mock Song', content: 'content', originalKey: 'G' }),
    loading: ref(false)
  }))
}));

vi.mock('../composables/useAppNavigation', () => ({
  useAppNavigation: vi.fn(() => ({
    goBack: vi.fn()
  }))
}));

vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: vi.fn(() => ({ id: '1', title: 'Mock Song', content: 'content', originalKey: 'G' })),
    initialize: vi.fn(),
    loading: ref(false)
  }
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: '1' } })),
  useRouter: vi.fn(() => ({ back: vi.fn() }))
}));

const mountAndWait = async () => {
  const Root = defineComponent({
    render() { return h(VLayout, null, { default: () => h(SongDetail) }) }
  })
  const wrapper = mount(Root, { global: { plugins: [vuetify] } }).findComponent(SongDetail);
  await flushPromises();
  return wrapper;
};

describe('SongDetail.vue (UI Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('calls openKeyDialog when key button is clicked', async () => {
    const mockOpenDialog = vi.fn();
    useKeyManager.mockReturnValue({
      keyDialog: ref(false),
      openKeyDialog: mockOpenDialog,
      selectedRoot: ref('G')
    });

    const wrapper = await mountAndWait();
    await wrapper.find('[data-testid="key-btn"]').trigger('click');
    expect(mockOpenDialog).toHaveBeenCalled();
  });

  it('shows textareas only when isEditMode is true', async () => {
    const isEditMode = ref(false);
    useSongEditor.mockReturnValue({
      isEditMode,
      paragraphs: ref([{ id: 'p1', lines: [] }]),
      initializeEditor: vi.fn()
    });

    const wrapper = await mountAndWait();
    expect(wrapper.find('[data-testid="lyrics-textarea"]').exists()).toBe(false);

    isEditMode.value = true;
    await flushPromises();
    expect(wrapper.find('[data-testid="lyrics-textarea"]').exists()).toBe(true);
  });

  it('calls toggleEditMode when edit button is clicked', async () => {
    const mockToggle = vi.fn();
    useSongEditor.mockReturnValue({
      isEditMode: ref(false),
      toggleEditMode: mockToggle,
      initializeEditor: vi.fn(),
      paragraphs: ref([])
    });

    const wrapper = await mountAndWait();
    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    expect(mockToggle).toHaveBeenCalled();
  });

  it('displays snackbar message from useSongActions', async () => {
    const snackbar = ref(false);
    const snackbarText = ref('Test Message');
    useSongActions.mockReturnValue({
      snackbar,
      snackbarText,
      handleShare: vi.fn()
    });

    const wrapper = await mountAndWait();
    expect(document.body.innerHTML).not.toContain('Test Message');

    snackbar.value = true;
    await flushPromises();
    expect(document.body.innerHTML).toContain('Test Message');
  });
});

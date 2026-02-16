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
    serialize: vi.fn(() => ''),
    createParagraph: vi.fn((type) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'verse',
      lines: []
    })),
    syncParagraphLines: vi.fn((p, text) => {
      p.lines = text.split('\n').map(l => ({ text: l, isSpacer: l.trim() === '' }));
    }),
    filterEmptyParagraphs: vi.fn(p => p.filter(item => {
      const text = (item.editText !== undefined) ? item.editText : (item.lines || []).map(l => l.text).join('');
      return text.trim().length > 0;
    }))
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
import LyricsService from '../services/LyricsService';

// Vuetify stubs - propagate data-testid and disabled for test selectors
const stubs = {
  'v-app-bar': { template: '<header><slot /></header>' },
  'v-container': { template: '<div><slot /></div>' },
  'v-btn': {
    template: '<button :data-testid="$attrs[\'data-testid\']" :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
    inheritAttrs: false
  },
  'v-icon': { template: '<i><slot /></i>' },
  'v-chip': {
    template: '<span :data-testid="$attrs[\'data-testid\']"><slot /></span>',
    inheritAttrs: false
  },
  'v-spacer': { template: '<div />' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-progress-circular': { template: '<div />' },
  'v-sheet': { template: '<div><slot /></div>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-snackbar': { template: '<div class="snackbar"><slot /></div>' },
  'v-dialog': { template: '<div class="dialog"><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-btn-toggle': { template: '<div><slot /></div>' },
  'v-btn-group': { template: '<div><slot /></div>' },
  'v-select': { template: '<div />' },
  'v-text-field': {
    template: '<input :data-testid="$attrs[\'data-testid\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    inheritAttrs: false
  },
  'v-textarea': {
    template: '<textarea :data-testid="$attrs[\'data-testid\']" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue'],
    inheritAttrs: false
  }
};

const mountOptions = { global: { stubs } };

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

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    expect(wrapper.find('[data-testid="key-chip"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="key-chip"]').text()).toBe('G');
    expect(wrapper.find('[data-testid="key-btn"]').exists()).toBe(false);
  });

  it('shows key as a button when authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    expect(wrapper.find('[data-testid="key-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="key-btn"]').text().trim()).toBe('G');
    expect(wrapper.find('[data-testid="key-chip"]').exists()).toBe(false);
  });

  it('opens dialog and parses key when key button is clicked', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');

    const dialog = wrapper.find('.dialog');
    expect(dialog.text()).toContain('G');
  });

  it('parses complex key correctly when opening dialog', async () => {
    SongsRepository.getSong.mockReturnValue({ ...mockSong, originalKey: 'C#m' });
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');

    const dialog = wrapper.find('.dialog');
    expect(dialog.text()).toContain('C#m');
  });

  it('saves new key via Change button and updates displayed key', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });
    SongsRepository.save.mockResolvedValue();

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');

    // Modify values via vm (v-select stubs can't emit v-model changes)
    wrapper.vm.selectedRoot = 'A';
    wrapper.vm.selectedAccidental = 'b';
    wrapper.vm.selectedQuality = 'm';

    await wrapper.find('[data-testid="key-save-btn"]').trigger('click');
    await flushPromises();

    expect(SongsRepository.save).toHaveBeenCalledWith('1', mockSong.content, null, 'Abm');
    expect(wrapper.find('.snackbar').text()).toContain('Key changed successfully');
    expect(wrapper.find('[data-testid="key-btn"]').text().trim()).toBe('Abm');
  });
});

describe('SongDetail.vue - Edit Mode Save Flow', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    originalKey: 'G',
    content: 'Test lyrics',
    bookNumber: '123'
  };

  const mockParagraphs = [
    { id: 'p1', type: 'verse', lines: [{ text: 'Line 1', isSpacer: false }] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
    LyricsService.parseToParagraphs.mockReturnValue([...mockParagraphs.map(p => ({ ...p, lines: [...p.lines] }))]);
    LyricsService.serialize.mockReturnValue('Line 1');
    useAuth.mockReturnValue({
      isAuthenticated: computed(() => true),
      isAuthenticating: ref(false)
    });
  });

  const findEditBtn = (wrapper) => wrapper.find('[data-testid="edit-btn"]');

  it('enters edit mode when edit button is clicked', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    expect(findEditBtn(wrapper).text()).toContain('edit_document');

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(findEditBtn(wrapper).text()).toContain('check');
  });

  it('saves and exits edit mode after successful persistence', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    // Enter edit mode
    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    expect(findEditBtn(wrapper).text()).toContain('check');

    // Exit edit mode — should save first
    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(LyricsService.serialize).toHaveBeenCalled();
    expect(SongsRepository.save).toHaveBeenCalledWith('1', 'Line 1', 'Test Song');
    expect(findEditBtn(wrapper).text()).toContain('edit_document');
    expect(wrapper.find('.snackbar').text()).toContain('Changes saved to cloud');
  });

  it('stays in edit mode when save fails', async () => {
    SongsRepository.save.mockRejectedValue(new Error('Network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(findEditBtn(wrapper).text()).toContain('check');
    expect(wrapper.find('.snackbar').text()).toContain('Error saving');
  });

  it('shows permission denied message on permission error', async () => {
    const permError = new Error('Permission denied');
    permError.code = 'permission-denied';
    SongsRepository.save.mockRejectedValue(permError);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(findEditBtn(wrapper).text()).toContain('check');
    expect(wrapper.find('.snackbar').text()).toContain('Permission Denied');
  });

  it('disables edit button while saving', async () => {
    let resolverFn;
    SongsRepository.save.mockImplementation(() => new Promise(resolve => { resolverFn = resolve; }));

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    expect(findEditBtn(wrapper).attributes('disabled')).toBeUndefined();

    // Start exiting — save is in progress
    const exitPromise = wrapper.vm.toggleEditMode();
    await flushPromises();

    expect(findEditBtn(wrapper).attributes('disabled')).toBe('');

    // Resolve save
    resolverFn();
    await exitPromise;
    await flushPromises();

    expect(findEditBtn(wrapper).attributes('disabled')).toBeUndefined();
    expect(findEditBtn(wrapper).text()).toContain('edit_document');
  });

  it('shows textareas when edit mode is active', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(0);

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);
  });

  it('textarea contains paragraph text when entering edit mode', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    const textarea = wrapper.find('[data-testid="lyrics-textarea"]');
    expect(textarea.element.value).toBe('Line 1');
  });

  it('saves modified textarea content', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    const textarea = wrapper.find('[data-testid="lyrics-textarea"]');
    await textarea.setValue('Modified Line 1\nNew Line 2');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(LyricsService.serialize).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'p1',
        type: 'verse',
        lines: [
          { text: 'Modified Line 1', isSpacer: false },
          { text: 'New Line 2', isSpacer: false }
        ]
      })
    ]);
  });

  it('hides textareas after exiting edit mode', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(0);
  });

  it('disables font size button in edit mode', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    const fontSizeBtn = wrapper.find('[data-testid="font-size-btn"]');
    expect(fontSizeBtn.attributes('disabled')).toBeUndefined();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(fontSizeBtn.attributes('disabled')).toBe('');
  });
});

describe('SongDetail.vue - Paragraph Management', () => {
  const mockSong = { id: '1', title: 'Test', content: 'Verse 1\n\nVerse 2' };
  const mockParagraphs = [
    { id: 'p1', type: 'verse', lines: [{ text: 'Verse 1', isSpacer: false }] },
    { id: 'p2', type: 'verse', lines: [{ text: 'Verse 2', isSpacer: false }] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
    LyricsService.parseToParagraphs.mockReturnValue([...mockParagraphs.map(p => ({ ...p, lines: [...p.lines] }))]);
    useAuth.mockReturnValue({ isAuthenticated: computed(() => true), isAuthenticating: ref(false) });
  });

  it('adds a paragraph above the current one', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(2);

    // Click "Add Above" on the second paragraph (index 1)
    await wrapper.findAll('[data-testid="add-above-btn"]')[1].trigger('click');
    await flushPromises();

    const textareas = wrapper.findAll('[data-testid="lyrics-textarea"]');
    expect(textareas).toHaveLength(3);
    expect(textareas[1].element.value).toBe(''); // New paragraph in the middle
    expect(textareas[0].element.value).toBe('Verse 1');
    expect(textareas[2].element.value).toBe('Verse 2');
  });

  it('adds a paragraph below the current one', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    // Click "Add Below" on the first paragraph (index 0)
    await wrapper.findAll('[data-testid="add-below-btn"]')[0].trigger('click');
    await flushPromises();

    const textareas = wrapper.findAll('[data-testid="lyrics-textarea"]');
    expect(textareas).toHaveLength(3);
    expect(textareas[1].element.value).toBe(''); // New paragraph in the middle
  });

  it('removes a paragraph', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(2);

    await wrapper.findAll('[data-testid="delete-paragraph-btn"]')[0].trigger('click');
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="lyrics-textarea"]').element.value).toBe('Verse 2');
  });

  it('disables delete button if only one paragraph remains', async () => {
    LyricsService.parseToParagraphs.mockReturnValue([{ id: 'p1', type: 'verse', lines: [] }]);
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    const deleteBtn = wrapper.find('[data-testid="delete-paragraph-btn"]');
    expect(deleteBtn.attributes('disabled')).toBeDefined();
  });

  it('allows editing and saving the song title', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    const titleInput = wrapper.find('[data-testid="title-input"]');
    expect(titleInput.exists()).toBe(true);
    
    await titleInput.setValue('New Updated Title');
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    expect(SongsRepository.save).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'New Updated Title'
    );
  });

  it('prevents saving if title is too short', async () => {
    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    const titleInput = wrapper.find('[data-testid="title-input"]');
    await titleInput.setValue('Ab'); // 2 chars
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.snackbar').text()).toContain('Title must have at least 3 characters');
    expect(wrapper.find('[data-testid="edit-btn"]').text()).toContain('check');
  });

  it('prevents saving if no paragraph has at least 3 characters', async () => {
    // Override parseToParagraphs for this test to have multiple paragraphs
    LyricsService.parseToParagraphs.mockReturnValue([
      { id: 'p1', type: 'verse', lines: [{ text: '1', isSpacer: false }] },
      { id: 'p2', type: 'verse', lines: [{ text: '2', isSpacer: false }] }
    ]);

    const wrapper = mount(SongDetail, mountOptions);
    await flushPromises();

    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    // Both are short, try to save
    await wrapper.find('[data-testid="edit-btn"]').trigger('click');
    await flushPromises();

    expect(wrapper.find('.snackbar').text()).toContain('Each paragraph must have at least 3 characters');
    // Should still be in edit mode (check icon)
    expect(wrapper.find('[data-testid="edit-btn"]').text()).toContain('check');
  });
});

